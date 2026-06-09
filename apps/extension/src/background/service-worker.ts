import { createApiClient } from "@gitpilot/api-client";
import {
  initAuth,
  getToken,
  getRefreshToken,
  setTokens,
  removeTokens,
} from "src/shared/auth";

// Service workers can be killed and restarted — re-populate the token cache
// from chrome.storage.local every time this module loads.
void initAuth();

const apiClient = createApiClient(
  import.meta.env.VITE_API_URL ?? "http://localhost:3000",
  { getToken, getRefreshToken, setTokens, removeTokens },
);

// ── Message handlers ─────────────────────────────────────────────────────────

interface GenerateCommitMsg {
  type: "GENERATE_COMMIT";
  diff: string;
  context?: string;
  provider?: string;
}

interface GeneratePrMsg {
  type: "GENERATE_PR";
  commits: string[];
  diff?: string;
  branch: string;
  baseBranch: string;
  provider?: string;
}

interface OttMsg {
  type: "OTT_RECEIVED";
  ott: string;
}

type IncomingMessage = GenerateCommitMsg | GeneratePrMsg | OttMsg;

chrome.runtime.onMessage.addListener(
  (message: IncomingMessage, _sender, sendResponse) => {
    if (message.type === "OTT_RECEIVED") {
      // Re-init auth after OTT exchange so cache is fresh
      apiClient
        .post<{ accessToken: string; refreshToken: string }>("/auth/exchange", {
          ott: message.ott,
        })
        .then((data) => {
          setTokens(data.accessToken, data.refreshToken);
          console.log("[GitPilot] Extension linked via OTT");
        })
        .catch((err: Error) =>
          console.error("[GitPilot] OTT exchange failed", err),
        );
      return false;
    }

    if (message.type === "GENERATE_COMMIT") {
      apiClient
        .post("/generate/commit", {
          diff: message.diff,
          context: message.context,
          provider: message.provider,
        })
        .then((data) => sendResponse({ ok: true, data }))
        .catch((err: Error) => sendResponse({ ok: false, error: err.message }));
      return true; // keep channel open for async response
    }

    if (message.type === "GENERATE_PR") {
      apiClient
        .post("/generate/pr", {
          commits: message.commits,
          diff: message.diff,
          branch: message.branch,
          baseBranch: message.baseBranch,
          provider: message.provider,
        })
        .then((data) => sendResponse({ ok: true, data }))
        .catch((err: Error) => sendResponse({ ok: false, error: err.message }));
      return true;
    }

    return false;
  },
);
