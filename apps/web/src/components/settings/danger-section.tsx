import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { useDeleteAccount } from "../../lib/queries";

export function DangerSection() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const { mutate: deleteAccount, isPending, error } = useDeleteAccount();

  const CONFIRM_PHRASE = "delete my account";
  const ready = confirmText.toLowerCase() === CONFIRM_PHRASE;

  return (
    <section className="rounded-xl border border-red-900/50 bg-red-950/20 p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle className="h-4 w-4 text-red-400" />
        <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wide">
          Danger Zone
        </h2>
      </div>
      <p className="text-sm text-zinc-400 mb-5">
        Permanently delete your account and all associated data. This cannot be
        undone.
      </p>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-2 rounded-lg border border-red-800 bg-red-950/40 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-900/40 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Delete account
        </button>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-red-900/60 bg-red-950/30 p-4 text-sm text-zinc-300 space-y-2">
            <p className="font-medium text-red-300">Before you continue:</p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400">
              <li>Your account will be soft-deleted immediately</li>
              <li>
                Your encrypted API key, password, and credentials will be wiped
                instantly
              </li>
              <li>
                All usage history and generation metadata will be deleted within
                30 days
              </li>
              <li>You will be logged out on all devices</li>
            </ul>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-zinc-400">
              Type{" "}
              <span className="font-mono text-zinc-200">{CONFIRM_PHRASE}</span>{" "}
              to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_PHRASE}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-red-700 focus:outline-none"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">
              Something went wrong. Please try again.
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => deleteAccount()}
              disabled={!ready || isPending}
              className="flex w-fit items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              {isPending ? "Deleting…" : "Yes, delete my account"}
            </button>
            <button
              onClick={() => {
                setShowConfirm(false);
                setConfirmText("");
              }}
              disabled={isPending}
              className="w-fit rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
