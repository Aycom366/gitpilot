import { Link } from "@tanstack/react-router";
import { Button } from "@gitpilot/ui";
import { Chrome } from "lucide-react";

export function CTA() {
  return (
    <section className='px-6 py-24'>
      <div className='mx-auto max-w-3xl text-center'>
        <div className='relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-600/10 to-zinc-950 px-8 py-16'>
          <div className='pointer-events-none absolute inset-0'>
            <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent' />
          </div>
          <h2 className='text-4xl font-bold text-white'>
            Ready to write better commits?
          </h2>
          <p className='mt-4 text-zinc-400'>
            Join developers who stopped wasting time on commit messages.
          </p>
          <div className='mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center'>
            <Button size='lg' className='gap-2'>
              <Chrome className='h-4 w-4' />
              Add to Chrome
            </Button>
            <Link to='/auth/register'>
              <Button variant='outline' size='lg'>
                Create free account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
