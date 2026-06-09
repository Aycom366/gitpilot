// Content script — runs on github.com pages
// Injects GitPilot buttons on commit and PR creation pages.

import {
  makeButton,
  setButtonState,
  showError,
  sendToBackground,
  setNativeValue,
} from "./shared";

// ── Page detection ────────────────────────────────────────────────────────────

const BTN_ID_COMMIT = "gitpilot-commit-btn";
const BTN_ID_PR = "gitpilot-pr-btn";
const LABEL_COMMIT = "Generate commit message";
const LABEL_PR = "Generate";

function isCommitPage(): boolean {
  return !!document.querySelector("textarea#commit-summary-input");
}

function isPrPage(): boolean {
  return (
    window.location.pathname.includes("/compare/") ||
    window.location.pathname.includes("/pull/new/")
  );
}

// ── Diff extraction ───────────────────────────────────────────────────────────

function extractDiff(): string {
  const parts: string[] = [];

  document
    .querySelectorAll<HTMLElement>(".file-header[data-path]")
    .forEach((header) => {
      const filePath = header.getAttribute("data-path") ?? "unknown";
      const fileBlock = header.closest(".js-file, .file");
      if (!fileBlock) return;

      const fileLines: string[] = [`--- a/${filePath}`, `+++ b/${filePath}`];
      fileBlock.querySelectorAll<HTMLElement>("tr").forEach((row) => {
        const cell = row.querySelector<HTMLElement>("[data-code-marker]");
        if (!cell) return;
        const marker = cell.getAttribute("data-code-marker") ?? " ";
        fileLines.push(`${marker}${cell.textContent ?? ""}`);
      });

      parts.push(fileLines.join("\n"));
    });

  return parts.join("\n\n").slice(0, 20000);
}

function extractPrData(): {
  commits: string[];
  branch: string;
  baseBranch: string;
  diff: string;
} {
  const branch =
    document
      .querySelector<HTMLElement>(
        "#head-ref-selector summary .css-truncate-target",
      )
      ?.textContent?.trim() ??
    window.location.pathname.split("/compare/")[1]?.split("?")[0] ??
    "feature";

  const baseBranch =
    document
      .querySelector<HTMLElement>(
        "#base-ref-selector summary .css-truncate-target",
      )
      ?.textContent?.trim() ?? "main";

  const commits = Array.from(
    document.querySelectorAll<HTMLElement>(
      'li[class*="commit"] a.Link--primary',
    ),
  )
    .map((el) => el.textContent?.trim())
    .filter(Boolean) as string[];

  return { commits, branch, baseBranch, diff: extractDiff() };
}

// ── Commit page ───────────────────────────────────────────────────────────────

function handleCommitPage() {
  if (document.getElementById(BTN_ID_COMMIT)) return;

  const titleInput = document.querySelector<HTMLTextAreaElement>(
    "textarea#commit-summary-input",
  );
  if (!titleInput?.parentElement) return;

  const btn = makeButton(BTN_ID_COMMIT, LABEL_COMMIT);
  titleInput.parentElement.appendChild(btn);

  btn.addEventListener("click", async () => {
    setButtonState(btn, true, LABEL_COMMIT);
    const resp = await sendToBackground({
      type: "GENERATE_COMMIT",
      diff: extractDiff(),
    });
    setButtonState(btn, false, LABEL_COMMIT);

    if (!resp.ok || !resp.data) {
      showError(resp.error ?? "Generation failed — are you logged in?");
      return;
    }

    setNativeValue(titleInput, resp.data.title ?? "");

    if (resp.data.body) {
      const desc = document.querySelector<HTMLTextAreaElement>(
        "textarea#commit-description-input",
      );
      if (desc) setNativeValue(desc, resp.data.body);
    }
  });
}

// ── PR page ───────────────────────────────────────────────────────────────────

function handlePrPage() {
  if (document.getElementById(BTN_ID_PR)) return;

  const titleInput = document.querySelector<HTMLInputElement>(
    'input[aria-labelledby="pull_request_title_header"]',
  );
  if (!titleInput?.parentElement) return;

  const btn = makeButton(BTN_ID_PR, LABEL_PR);
  titleInput.parentElement.appendChild(btn);

  btn.addEventListener("click", async () => {
    setButtonState(btn, true, LABEL_PR);
    const { commits, branch, baseBranch, diff } = extractPrData();

    const resp = await sendToBackground({
      type: "GENERATE_PR",
      commits: commits.length ? commits : ["(no commits extracted)"],
      diff,
      branch,
      baseBranch,
    });

    setButtonState(btn, false, LABEL_PR);

    if (!resp.ok || !resp.data) {
      showError(resp.error ?? "Generation failed — are you logged in?");
      return;
    }

    if (resp.data.title) setNativeValue(titleInput, resp.data.title);

    const bodyText = resp.data.body ?? resp.data.description;
    if (bodyText) {
      const desc = document.querySelector<HTMLTextAreaElement>(
        "textarea#pull_request_body",
      );
      if (desc) setNativeValue(desc, bodyText);
    }
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────

function init() {
  if (isCommitPage()) handleCommitPage();
  if (isPrPage()) handlePrPage();
}

// GitHub uses Turbo navigation — re-run on each page transition
document.addEventListener("DOMContentLoaded", init);
document.addEventListener("turbo:render", init);
document.addEventListener("pjax:end", init);

if (document.readyState !== "loading") init();
