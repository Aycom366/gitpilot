// Content script — runs on github.com pages
// Injects ✨ GitPilot buttons on commit and PR creation pages.

const BTN_ID_COMMIT = 'gitpilot-commit-btn';
const BTN_ID_PR = 'gitpilot-pr-btn';

// ── DOM helpers ──────────────────────────────────────────────────────────────

function isCommitPage(): boolean {
  return !!document.querySelector('textarea#commit-summary-input');
}

function isPrPage(): boolean {
  return (
    window.location.pathname.includes('/compare/') ||
    window.location.pathname.includes('/pull/new/')
  );
}

function makeButton(id: string, label: string): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.id = id;
  btn.type = 'button';
  btn.textContent = `✨ ${label}`;
  btn.style.cssText = [
    'display:inline-flex;align-items:center;gap:4px',
    'padding:4px 10px',
    'border-radius:6px',
    'border:1px solid #6d28d9',
    'background:#4c1d95',
    'color:#ede9fe',
    'font-size:12px',
    'font-weight:500',
    'cursor:pointer',
    'margin-left:8px',
    'transition:opacity 0.15s',
  ].join(';');
  return btn;
}

function setButtonState(btn: HTMLButtonElement, loading: boolean, label: string) {
  btn.disabled = loading;
  btn.textContent = loading ? '⏳ Generating…' : `✨ ${label}`;
  btn.style.opacity = loading ? '0.7' : '1';
}

// ── Diff extraction ──────────────────────────────────────────────────────────

function extractCommitDiff(): string {
  const lines: string[] = [];
  document.querySelectorAll('.blob-code-inner').forEach((el) => {
    const row = el.closest('tr');
    if (!row) return;
    if (row.classList.contains('blob-code-addition')) lines.push(`+ ${el.textContent}`);
    else if (row.classList.contains('blob-code-deletion')) lines.push(`- ${el.textContent}`);
  });
  return lines.join('\n').slice(0, 8000);
}

function extractPrData(): { commits: string[]; branch: string; baseBranch: string; diff: string } {
  const branchEl = document.querySelector<HTMLElement>('.compare-branch-name, .head-ref');
  const baseEl = document.querySelector<HTMLElement>('.base-ref, .base-branch-name');
  const branch = branchEl?.textContent?.trim() ?? window.location.pathname.split('/').pop() ?? 'feature';
  const baseBranch = baseEl?.textContent?.trim() ?? 'main';

  const commits: string[] = [];
  document.querySelectorAll('.commit-message, .js-commits-list .message').forEach((el) => {
    const text = el.textContent?.trim();
    if (text) commits.push(text);
  });

  return { commits, branch, baseBranch, diff: extractCommitDiff() };
}

// ── Service worker messaging ─────────────────────────────────────────────────

interface GenerateResponse {
  ok: boolean;
  data?: { title?: string; body?: string; description?: string };
  error?: string;
}

function sendToBackground(msg: unknown): Promise<GenerateResponse> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(msg, (response: GenerateResponse) => {
      resolve(response ?? { ok: false, error: 'No response from extension' });
    });
  });
}

// ── Toast helper ─────────────────────────────────────────────────────────────

function showError(msg: string) {
  const toast = document.createElement('div');
  toast.style.cssText = [
    'position:fixed;bottom:24px;right:24px;z-index:99999',
    'background:#18181b;color:#fca5a5;border:1px solid #991b1b',
    'border-radius:8px;padding:10px 14px;font-size:13px',
    'box-shadow:0 4px 16px rgba(0,0,0,.5)',
  ].join(';');
  toast.textContent = `GitPilot: ${msg}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ── Commit page ──────────────────────────────────────────────────────────────

function handleCommitPage() {
  if (document.getElementById(BTN_ID_COMMIT)) return;

  const titleInput = document.querySelector<HTMLTextAreaElement>('textarea#commit-summary-input');
  if (!titleInput?.parentElement) return;

  const btn = makeButton(BTN_ID_COMMIT, 'Generate commit message');
  titleInput.parentElement.appendChild(btn);

  btn.addEventListener('click', async () => {
    setButtonState(btn, true, 'Generate commit message');

    const resp = await sendToBackground({
      type: 'GENERATE_COMMIT',
      diff: extractCommitDiff(),
    });

    setButtonState(btn, false, 'Generate commit message');

    if (!resp.ok || !resp.data) {
      showError(resp.error ?? 'Generation failed — are you logged in?');
      return;
    }

    titleInput.value = resp.data.title ?? '';
    titleInput.dispatchEvent(new Event('input', { bubbles: true }));

    if (resp.data.body) {
      const desc = document.querySelector<HTMLTextAreaElement>('textarea#commit-description-input');
      if (desc) {
        desc.value = resp.data.body;
        desc.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  });
}

// ── PR page ──────────────────────────────────────────────────────────────────

function handlePrPage() {
  if (document.getElementById(BTN_ID_PR)) return;

  const titleInput = document.querySelector<HTMLInputElement>('input#pull_request_title');
  if (!titleInput?.parentElement) return;

  const btn = makeButton(BTN_ID_PR, 'Generate PR description');
  titleInput.parentElement.appendChild(btn);

  btn.addEventListener('click', async () => {
    setButtonState(btn, true, 'Generate PR description');

    const { commits, branch, baseBranch, diff } = extractPrData();
    const resp = await sendToBackground({
      type: 'GENERATE_PR',
      commits: commits.length ? commits : ['(no commits extracted)'],
      diff,
      branch,
      baseBranch,
    });

    setButtonState(btn, false, 'Generate PR description');

    if (!resp.ok || !resp.data) {
      showError(resp.error ?? 'Generation failed — are you logged in?');
      return;
    }

    if (resp.data.title) {
      titleInput.value = resp.data.title;
      titleInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    const bodyText = resp.data.body ?? resp.data.description;
    if (bodyText) {
      const desc = document.querySelector<HTMLTextAreaElement>('textarea#pull_request_body');
      if (desc) {
        desc.value = bodyText;
        desc.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  });
}

// ── Init ─────────────────────────────────────────────────────────────────────

function init() {
  if (isCommitPage()) handleCommitPage();
  if (isPrPage()) handlePrPage();
}

// GitHub uses Turbo navigation — re-run on each page transition
document.addEventListener('DOMContentLoaded', init);
document.addEventListener('turbo:render', init);
document.addEventListener('pjax:end', init);

// Run immediately if DOM already loaded
if (document.readyState !== 'loading') init();
