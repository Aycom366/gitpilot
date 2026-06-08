// Content script — runs on github.com pages
// Detects commit and PR creation pages, injects the Generate button

function isCommitPage(): boolean {
  return document.querySelector('textarea#commit-summary-input') !== null;
}

function isPrPage(): boolean {
  return (
    window.location.pathname.includes('/compare/') ||
    window.location.pathname.includes('/pull/new/')
  );
}

function injectButton(targetEl: Element, onClick: () => void) {
  if (document.getElementById('gitpilot-btn')) return;
  const btn = document.createElement('button');
  btn.id = 'gitpilot-btn';
  btn.textContent = '✨ GitPilot';
  btn.style.cssText =
    'margin-left:8px;padding:4px 10px;border-radius:6px;border:1px solid #ccc;background:#fff;cursor:pointer;font-size:12px;';
  btn.addEventListener('click', onClick);
  targetEl.appendChild(btn);
}

function handleCommitPage() {
  const titleInput = document.querySelector<HTMLTextAreaElement>(
    'textarea#commit-summary-input',
  );
  if (!titleInput?.parentElement) return;

  injectButton(titleInput.parentElement, async () => {
    // TODO: extract diff and call background service worker
    console.log('[GitPilot] Generate commit message');
  });
}

function handlePrPage() {
  const titleInput = document.querySelector<HTMLInputElement>(
    'input#pull_request_title',
  );
  if (!titleInput?.parentElement) return;

  injectButton(titleInput.parentElement, async () => {
    // TODO: extract commits + diff and call background service worker
    console.log('[GitPilot] Generate PR title + description');
  });
}

// Run on page load and on GitHub's pjax navigation
function init() {
  if (isCommitPage()) handleCommitPage();
  if (isPrPage()) handlePrPage();
}

document.addEventListener('DOMContentLoaded', init);
document.addEventListener('pjax:end', init);
