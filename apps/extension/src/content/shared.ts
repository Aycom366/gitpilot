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

/**
 * Compute a unified diff between two texts using LCS.
 * Capped at 600 lines each to keep runtime O(n²) bounded.
 */
export function computeUnifiedDiff(
  original: string,
  modified: string,
  filename: string,
): string {
  if (original === modified) return "";

  const A = original.split("\n").slice(0, 600);
  const B = modified.split("\n").slice(0, 600);
  const N = A.length,
    M = B.length;

  // LCS length table
  const dp: Uint16Array[] = Array.from(
    { length: N + 1 },
    () => new Uint16Array(M + 1),
  );
  for (let i = 1; i <= N; i++) {
    for (let j = 1; j <= M; j++) {
      dp[i][j] =
        A[i - 1] === B[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  // Backtrack into edit ops
  const ops: Array<{ t: " " | "+" | "-"; s: string }> = [];
  let i = N,
    j = M;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && A[i - 1] === B[j - 1]) {
      ops.unshift({ t: " ", s: A[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.unshift({ t: "+", s: B[j - 1] });
      j--;
    } else {
      ops.unshift({ t: "-", s: A[i - 1] });
      i--;
    }
  }

  // Show changed lines ± 3 context lines
  const CTX = 3;
  const show = new Set<number>();
  ops.forEach((op, idx) => {
    if (op.t !== " ") {
      for (
        let c = Math.max(0, idx - CTX);
        c <= Math.min(ops.length - 1, idx + CTX);
        c++
      ) {
        show.add(c);
      }
    }
  });

  const out: string[] = [`--- a/${filename}`, `+++ b/${filename}`];
  let inBlock = false;
  ops.forEach((op, idx) => {
    if (!show.has(idx)) {
      inBlock = false;
      return;
    }
    if (!inBlock) {
      out.push("@@ ... @@");
      inBlock = true;
    }
    out.push(`${op.t}${op.s}`);
  });

  return out.join("\n").slice(0, 20000);
}
