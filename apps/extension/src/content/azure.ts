import {
  makeButton,
  setButtonState,
  showError,
  sendToBackground,
  setNativeValue,
  computeUnifiedDiff,
} from "./shared";

const BTN_ID = "gitpilot-azure-pr-btn";
const LABEL = "✨ Generate PR";

const BTN_ID_COMMIT = "gitpilot-azure-commit-btn";
const LABEL_COMMIT = "✨ Generate message";

function isCreatePrPage(): boolean {
  return /\/_git\/.+\/pullrequestcreate/.test(window.location.pathname);
}

function getBranchInfo(): { branch: string; baseBranch: string } {
  const p = new URLSearchParams(window.location.search);
  return {
    branch: p.get("sourceRef") ?? "feature",
    baseBranch: p.get("targetRef") ?? "main",
  };
}

function clickTab(labelSubstring: string): void {
  const tab = Array.from(
    document.querySelectorAll<HTMLElement>('[role="tab"], .bolt-tab'),
  ).find((t) => t.textContent?.includes(labelSubstring));
  tab?.click();
}

function waitForSelector(selector: string, timeout = 3000): Promise<void> {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      resolve();
      return;
    }
    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(document.body, { subtree: true, childList: true });
    setTimeout(() => {
      observer.disconnect();
      resolve();
    }, timeout);
  });
}

function extractChangedFiles(): string {
  return Array.from(
    document.querySelectorAll<HTMLElement>(".bolt-list-cell .text-ellipsis"),
  )
    .map((el) => el.textContent?.trim())
    .filter(Boolean)
    .map((f) => `M\t${f}`)
    .join("\n");
}

function extractCommits(): string[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>(".commit-title.text-ellipsis"),
  )
    .map((el) => el.textContent?.trim())
    .filter(Boolean) as string[];
}

async function collectData(): Promise<{ commits: string[]; diff: string }> {
  clickTab("Commits");
  await waitForSelector(".commit-title.text-ellipsis");
  const commits = extractCommits();

  clickTab("Files");
  await waitForSelector(".bolt-list-cell .text-ellipsis");
  const diff = extractChangedFiles();

  clickTab("Overview");

  return { commits, diff };
}

function getTitleInput(): HTMLInputElement | null {
  const selectors = [
    'input[aria-label="Enter a title"]',
    'input[placeholder="Enter a title"]',
    'input[placeholder*="title" i]',
    "input.bolt-textfield-input",
  ];
  for (const sel of selectors) {
    const el = document.querySelector<HTMLInputElement>(sel);
    if (el) return el;
  }
  return null;
}

function getDescriptionEditor(): HTMLTextAreaElement | null {
  const selectors = [
    'textarea[aria-label="Description"]',
    "textarea.bolt-textarea-input",
    '[placeholder*="description" i]',
  ];
  for (const sel of selectors) {
    const el = document.querySelector<HTMLTextAreaElement>(sel);
    if (el) return el;
  }
  return null;
}

// ── Azure file editor commit panel ────────────────────────────────────────────

/**
 * Switch to "Highlight changes" tab, ask the MAIN-world azure-main.ts to read
 * Monaco model values (via postMessage bridge), compute unified diff, then
 * switch back. The bridge is needed because content scripts run in an isolated
 * JS context and cannot access window.monaco directly.
 */
async function getAzureFileDiff(): Promise<string> {
  const filename =
    new URLSearchParams(window.location.search)
      .get("path")
      ?.replace(/^\//, "") ?? "unknown";

  // Switch to diff tab so Monaco loads both models.
  clickTab("Highlight changes");

  // Ask the MAIN-world script for model values.
  const result = await new Promise<{ origVal: string; modVal: string } | null>(
    (resolve) => {
      const requestId = `gp-${Date.now()}`;
      const timer = setTimeout(() => {
        window.removeEventListener("message", handler);
        resolve(null);
      }, 5000);

      const handler = (e: MessageEvent) => {
        if (
          e.data?.type === "GITPILOT_MONACO_RESULT" &&
          e.data.requestId === requestId
        ) {
          clearTimeout(timer);
          window.removeEventListener("message", handler);
          const { origVal, modVal } = e.data as {
            origVal: string | null;
            modVal: string | null;
          };
          resolve(origVal && modVal ? { origVal, modVal } : null);
        }
      };

      window.addEventListener("message", handler);
      window.postMessage({ type: "GITPILOT_READ_MONACO", requestId }, "*");
    },
  );

  // Switch back to Contents tab.
  clickTab("Contents");

  if (!result) return "";
  return computeUnifiedDiff(result.origVal, result.modVal, filename);
}

/** Show an error message inline inside the commit panel (above footer buttons). */
function showPanelError(msg: string) {
  const existing = document.getElementById("gitpilot-panel-error");
  if (existing) {
    existing.textContent = `⚠ ${msg}`;
    return;
  }

  const err = document.createElement("div");
  err.id = "gitpilot-panel-error";
  err.style.cssText = [
    "color:#fca5a5;background:#3b0000;border:1px solid #991b1b",
    "border-radius:4px;padding:6px 10px;font-size:12px;margin:4px 0",
  ].join(";");
  err.textContent = `⚠ ${msg}`;

  const footer = document.querySelector(".bolt-panel-footer");
  if (footer) footer.insertAdjacentElement("beforebegin", err);
  else document.querySelector(".bolt-panel-footer-buttons")?.before(err);

  setTimeout(() => err.remove(), 6000);
}

function handleCommitPanel() {
  if (document.getElementById(BTN_ID_COMMIT)) return;

  const textarea = document.querySelector<HTMLTextAreaElement>(
    "textarea.repos-commit-panel-comment-input",
  );
  if (!textarea) return;

  const footerBtns = document.querySelector<HTMLElement>(
    ".bolt-panel-footer-buttons",
  );
  if (!footerBtns) return;

  const btn = makeButton(
    BTN_ID_COMMIT,
    LABEL_COMMIT,
    "padding:5px 12px;border-radius:4px;",
  );
  footerBtns.insertBefore(btn, footerBtns.firstChild);

  btn.addEventListener("click", async () => {
    setButtonState(btn, true, LABEL_COMMIT);

    const diff = await getAzureFileDiff();
    if (!diff) {
      setButtonState(btn, false, LABEL_COMMIT);
      showPanelError("No changes detected — make edits before generating.");
      return;
    }

    const resp = await sendToBackground({ type: "GENERATE_COMMIT", diff });
    setButtonState(btn, false, LABEL_COMMIT);

    if (!resp.ok || !resp.data) {
      showPanelError(resp.error ?? "Generation failed — are you logged in?");
      return;
    }

    const freshTextarea = document.querySelector<HTMLTextAreaElement>(
      "textarea.repos-commit-panel-comment-input",
    );
    if (freshTextarea) setNativeValue(freshTextarea, resp.data.title ?? "");
  });
}

// Watch for the commit panel appearing (opened when user clicks Commit on file editor)
let commitPanelTimer: ReturnType<typeof setTimeout> | null = null;
new MutationObserver(() => {
  if (document.getElementById(BTN_ID_COMMIT)) return;
  if (!document.querySelector("textarea.repos-commit-panel-comment-input"))
    return;
  if (commitPanelTimer) return;
  commitPanelTimer = setTimeout(() => {
    commitPanelTimer = null;
    handleCommitPanel();
  }, 80);
}).observe(document.body, { subtree: true, childList: true });

// ─────────────────────────────────────────────────────────────────────────────

let isGenerating = false;

function injectButton(titleInput: HTMLInputElement) {
  if (document.getElementById(BTN_ID)) return;

  const btn = makeButton(BTN_ID, LABEL, "padding:5px 12px;border-radius:4px;");
  const container =
    titleInput.closest(
      ".repos-pr-create-form-title, .bolt-textfield, .input-container",
    ) ?? titleInput.parentElement;
  container?.appendChild(btn);

  if (isGenerating) setButtonState(btn, true, LABEL);

  btn.addEventListener("click", async () => {
    if (isGenerating) return;
    isGenerating = true;
    setButtonState(btn, true, LABEL);

    const { branch, baseBranch } = getBranchInfo();
    const { commits, diff } = await collectData();

    const resp = await sendToBackground({
      type: "GENERATE_PR",
      commits: commits.length ? commits : [`Branch: ${branch} → ${baseBranch}`],
      diff: diff || `Branch: ${branch} → ${baseBranch}`,
      branch,
      baseBranch,
    });

    /**
     * Allow tracking of button state for isLoading state
     */
    isGenerating = false;
    const liveBtn = (document.getElementById(BTN_ID) ??
      btn) as HTMLButtonElement;
    setButtonState(liveBtn, false, LABEL);

    if (!resp.ok || !resp.data) {
      showError(resp.error ?? "Generation failed — are you logged in?");
      return;
    }

    const freshTitle = getTitleInput();
    if (resp.data.title && freshTitle)
      setNativeValue(freshTitle, resp.data.title);

    const body = resp.data.body ?? resp.data.description;
    if (body) {
      const desc = getDescriptionEditor();
      if (desc) setNativeValue(desc, body);
    }
  });
}

function tryInject() {
  if (!isCreatePrPage()) return;
  if (document.getElementById(BTN_ID)) return;
  const titleInput = getTitleInput();
  if (titleInput) injectButton(titleInput);
}

let reinjectTimer: ReturnType<typeof setTimeout> | null = null;
let lastUrl = location.href;

new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    if (reinjectTimer) clearTimeout(reinjectTimer);
    reinjectTimer = setTimeout(() => {
      reinjectTimer = null;
      tryInject();
    }, 300);
    return;
  }

  if (!isCreatePrPage() || document.getElementById(BTN_ID)) return;
  if (reinjectTimer) return;
  reinjectTimer = setTimeout(() => {
    reinjectTimer = null;
    tryInject();
  }, 150);
}).observe(document.body, { subtree: true, childList: true });

document.addEventListener("DOMContentLoaded", tryInject);
if (document.readyState !== "loading") tryInject();
