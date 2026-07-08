import { useState } from "react";
import { toast } from "sonner";
import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@gitpilot/ui";
import { useCreateResource } from "../../hooks/use-api";
import { parseError } from "../../lib/utils";
import { SectionCard } from "./section-card";

export function ExtensionSection() {
  const [ottDeepLink, setOttDeepLink] = useState<string | null>(null);

  const ottMutation = useCreateResource<
    { ott: string; deepLink: string },
    void
  >({
    endpoint: "/auth/extension-token",
  });

  function onConnectExtension() {
    ottMutation.mutate(undefined, {
      onSuccess: (data) => {
        setOttDeepLink(data.deepLink);
        window.open(data.deepLink, "_blank");
      },
      onError: (e) => toast.error(parseError(e)),
    });
  }

  return (
    <SectionCard
      title='Chrome Extension'
      description='Link the GitPilot extension to this account'
    >
      {ottDeepLink ? (
        <div className='space-y-3'>
          <p className='text-sm text-zinc-400'>
            A link was opened. If the extension didn't respond, copy it
            manually:
          </p>
          <div className='flex min-w-0 items-center gap-2 rounded-lg bg-zinc-800 px-3 py-2'>
            <code className='min-w-0 flex-1 truncate text-xs text-zinc-300'>
              {ottDeepLink}
            </code>
            <button
              type='button'
              onClick={() => {
                void navigator.clipboard.writeText(ottDeepLink);
                toast.success("Copied!");
              }}
              className='text-zinc-500 hover:text-zinc-300 transition-colors'
            >
              <Copy className='h-4 w-4' />
            </button>
          </div>
          <Button
            size='sm'
            variant='outline'
            onClick={() => {
              setOttDeepLink(null);
              onConnectExtension();
            }}
          >
            Generate new link
          </Button>
        </div>
      ) : (
        <div className='space-y-3'>
          <p className='text-sm text-zinc-400'>
            Make sure you have the GitPilot extension installed in Chrome, then
            click below.
          </p>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
            <Button
              size='sm'
              disabled={ottMutation.isPending}
              onClick={onConnectExtension}
              className='w-fit'
            >
              {ottMutation.isPending ? "Generating link…" : "Connect Extension"}
            </Button>
            <a
              href='https://chromewebstore.google.com/detail/gitpilot/ljbfncdhembpjmfhicbghnnkioecegmb'
              target='_blank'
              rel='noopener noreferrer'
              className='flex w-fit items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors'
            >
              <ExternalLink className='h-3 w-3' />
              Get extension
            </a>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
