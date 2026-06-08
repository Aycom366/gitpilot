import { Link } from "@tanstack/react-router";
import { Button } from "@gitpilot/ui";
import { GitCommitHorizontal } from "lucide-react";

export function Navbar() {
  return (
    <nav className='fixed top-0 z-50 w-full border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur'>
      <div className='mx-auto flex h-16 max-w-6xl items-center justify-between px-6'>
        <div className='flex items-center gap-2'>
          <GitCommitHorizontal className='h-5 w-5 text-violet-400' />
          <span className='text-lg font-bold text-white'>GitPilot</span>
        </div>
        <div className='hidden items-center gap-8 text-sm text-zinc-400 md:flex'>
          <a href='#features' className='hover:text-white transition-colors'>
            Features
          </a>
          <a
            href='#how-it-works'
            className='hover:text-white transition-colors'
          >
            How it works
          </a>
          <a href='#pricing' className='hover:text-white transition-colors'>
            Pricing
          </a>
        </div>
        <div className='flex items-center gap-3'>
          <Link to='/auth/login'>
            <Button variant='ghost' size='sm'>
              Log in
            </Button>
          </Link>
          <Link to='/auth/register'>
            <Button size='sm'>Get started</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
