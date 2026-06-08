import { toast } from "sonner";
import { ExternalLink } from "lucide-react";
import { useCreateResource } from "src/shared/hooks";

export function LinksSection() {
  const ottMutation = useCreateResource<
    { ott: string; deepLink: string },
    void
  >({
    endpoint: "/auth/extension-token",
  });

  return (
    <section className='border-t border-zinc-800 pt-4 space-y-2'>
      <a
        href={import.meta.env.VITE_WEB_URL ?? "http://localhost:5173"}
        target='_blank'
        rel='noopener noreferrer'
        className='flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors'
      >
        <ExternalLink className='h-3.5 w-3.5' />
        Open web dashboard
      </a>
      <button
        onClick={() =>
          ottMutation.mutate(undefined, {
            onSuccess: (data) => window.open(data.deepLink, "_blank"),
            onError: () => toast.error("Failed to generate link"),
          })
        }
        disabled={ottMutation.isPending}
        className='text-xs text-zinc-500 hover:text-zinc-300 transition-colors'
      >
        {ottMutation.isPending ? "Generating link…" : "Re-link this extension"}
      </button>
    </section>
  );
}
