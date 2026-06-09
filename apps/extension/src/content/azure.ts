import {
  makeButton,
  setButtonState,
  showError,
  sendToBackground,
  setNativeValue,
} from "./shared";

const BTN_ID = "gitpilot-azure-pr-btn";
const LABEL = "✨ Generate PR";

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

function injectButton(titleInput: HTMLInputElement) {
  if (document.getElementById(BTN_ID)) return;

  const btn = makeButton(BTN_ID, LABEL, "padding:5px 12px;border-radius:4px;");
  const container =
    titleInput.closest(
      ".repos-pr-create-form-title, .bolt-textfield, .input-container",
    ) ?? titleInput.parentElement;
  container?.appendChild(btn);

  btn.addEventListener("click", async () => {
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

    setButtonState(btn, false, LABEL);

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
