// Shared utilities for GitPilot content scripts

export const BASE_BUTTON_STYLES = [
  "display:inline-flex;align-items:center;gap:4px",
  "border:1px solid #6d28d9",
  "background:#4c1d95",
  "color:#ede9fe",
  "font-size:12px",
  "font-weight:500",
  "cursor:pointer",
  "transition:opacity 0.15s",
].join(";");

export function makeButton(
  id: string,
  label: string,
  extraStyles = "padding:4px 10px;border-radius:6px;margin-left:8px",
): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.id = id;
  btn.type = "button";
  btn.textContent = label;
  btn.style.cssText = `${BASE_BUTTON_STYLES};${extraStyles}`;
  return btn;
}

export function setButtonState(
  btn: HTMLButtonElement,
  loading: boolean,
  label: string,
): void {
  btn.disabled = loading;
  btn.textContent = loading ? "Generating…" : label;
  btn.style.opacity = loading ? "0.7" : "1";
}

export function showError(msg: string): void {
  const toast = document.createElement("div");
  toast.style.cssText = [
    "position:fixed;bottom:24px;right:24px;z-index:99999",
    "background:#18181b;color:#fca5a5;border:1px solid #991b1b",
    "border-radius:8px;padding:10px 14px;font-size:13px",
    "box-shadow:0 4px 16px rgba(0,0,0,.5)",
  ].join(";");
  toast.textContent = `GitPilot: ${msg}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

export interface GenerateResponse {
  ok: boolean;
  data?: { title?: string; body?: string; description?: string };
  error?: string;
}

export function sendToBackground(msg: unknown): Promise<GenerateResponse> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(msg, (response: GenerateResponse) => {
      resolve(response ?? { ok: false, error: "No response from extension" });
    });
  });
}

export function setNativeValue(
  el: HTMLInputElement | HTMLTextAreaElement,
  value: string,
): void {
  el.focus();
  el.setSelectionRange(0, el.value.length);
  document.execCommand("insertText", false, value);
}
