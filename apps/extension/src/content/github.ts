// Content script — runs on github.com pages
// Injects GitPilot buttons on commit and PR creation pages.

import {
  makeButton,
  setButtonState,
  showError,
  sendToBackground,
  setNativeValue,
  computeUnifiedDiff,
} from "./shared";

const BTN_ID_COMMIT = "gitpilot-commit-btn";
const BTN_ID_PR = "gitpilot-pr-btn";
const LABEL_COMMIT = "Generate message";
const LABEL_PR = "Generate";

// ── In-memory original content capture ───────────────────────────────────────
// Captured when the edit page first loads (before any user edits).

let originalContent: string | null = null;
let captureTimer: ReturnType<typeof setTimeout> | null = null;

function isEditPage(): boolean {
  return window.location.pathname.includes("/edit/");
}

function getEditFilename(): string {
  const parts = window.location.pathname.split("/edit/");
  if (parts.length < 2) return "unknown";
  return parts[1].split("/").slice(1).join("/") || "unknown";
}

function readEditorLines(): string {
  return Array.from(document.querySelectorAll<HTMLElement>(".cm-line"))
    .map((l) => l.textContent ?? "")
    .join("\n");
}

function captureOriginalContent() {
  if (originalContent !== null) return; // already captured
  const content = readEditorLines();
  if (content.trim()) {
    originalContent = content;
    return;
  }
  // CodeMirror not ready yet — retry
  if (!captureTimer) {
    captureTimer = setTimeout(() => {
      captureTimer = null;
      captureOriginalContent();
    }, 300);
  }
}

function getCommitDiff(): string {
  if (!isEditPage()) return readEditorLines().slice(0, 20000);

  const current = readEditorLines();
  if (!originalContent || originalContent === current) {
    // No changes detected or original unknown — fall back to full content
    return `File: ${getEditFilename()}\n\n${current}`.slice(0, 20000);
  }

  const diff = computeUnifiedDiff(originalContent, current, getEditFilename());
  return diff || `File: ${getEditFilename()}\n\n${current}`.slice(0, 20000);
}

// ── PR diff extraction ────────────────────────────────────────────────────────

function extractPrDiff(): string {
  const parts: string[] = [];
  document
    .querySelectorAll<HTMLElement>(".file-header[data-path]")
    .forEach((header) => {
      const filePath = header.getAttribute("data-path") ?? "unknown";
      const fileBlock = header.closest(".js-file, .file");
      if (!fileBlock) return;
      const lines: string[] = [`--- a/${filePath}`, `+++ b/${filePath}`];
      fileBlock.querySelectorAll<HTMLElement>("tr").forEach((row) => {
        const cell = row.querySelector<HTMLElement>("[data-code-marker]");
        if (!cell) return;
        lines.push(
          `${cell.getAttribute("data-code-marker") ?? " "}${cell.textContent ?? ""}`,
        );
      });
      parts.push(lines.join("\n"));
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

  return { commits, branch, baseBranch, diff: extractPrDiff() };
}

// ── Commit modal ──────────────────────────────────────────────────────────────

function handleCommitModal() {
  if (document.getElementById(BTN_ID_COMMIT)) return;

  const titleInput = document.querySelector<HTMLInputElement>(
    "input#commit-message-input",
  );
  if (!titleInput) return;

  const formControl = titleInput.closest(
    ".prc-FormControl-ControlVerticalLayout-8YotI, [class*='FormControl']",
  );
  if (!formControl) return;

  const btn = makeButton(
    BTN_ID_COMMIT,
    LABEL_COMMIT,
    "padding:4px 10px;border-radius:6px;margin:6px 0;display:block",
  );
  formControl.insertAdjacentElement("afterend", btn);

  btn.addEventListener("click", async () => {
    const diff = getCommitDiff();
    setButtonState(btn, true, LABEL_COMMIT);
    const resp = await sendToBackground({ type: "GENERATE_COMMIT", diff });
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

function isPrPage(): boolean {
  return (
    window.location.pathname.includes("/compare/") ||
    window.location.pathname.includes("/pull/new/")
  );
}

// Watch for commit modal (dynamically injected by GitHub's React)
let commitModalTimer: ReturnType<typeof setTimeout> | null = null;
new MutationObserver(() => {
  if (document.getElementById(BTN_ID_COMMIT)) return;
  if (!document.querySelector("input#commit-message-input")) return;
  if (commitModalTimer) return;
  commitModalTimer = setTimeout(() => {
    commitModalTimer = null;
    handleCommitModal();
  }, 80);
}).observe(document.body, { subtree: true, childList: true });

// Watch for PR button being removed — GitHub re-renders the title area when it
// auto-populates the PR title (e.g. after branch selection), which removes any
// injected elements.
let prReinjectTimer: ReturnType<typeof setTimeout> | null = null;
new MutationObserver(() => {
  if (!isPrPage()) return;
  if (document.getElementById(BTN_ID_PR)) return;
  if (prReinjectTimer) return;
  prReinjectTimer = setTimeout(() => {
    prReinjectTimer = null;
    handlePrPage();
  }, 80);
}).observe(document.body, { subtree: true, childList: true });

function init() {
  if (isEditPage()) captureOriginalContent();
  if (isPrPage()) handlePrPage();
}

document.addEventListener("DOMContentLoaded", init);
document.addEventListener("turbo:render", () => {
  // Page navigated — reset captured content for new edit page
  originalContent = null;
  init();
});
document.addEventListener("pjax:end", () => {
  originalContent = null;
  init();
});

if (document.readyState !== "loading") init();
