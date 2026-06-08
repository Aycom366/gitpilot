import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center'>
      <h1 className='text-4xl font-bold'>GitPilot</h1>
      <p className='mt-2 text-muted-foreground'>
        AI-powered commit messages and PR descriptions
      </p>
    </main>
  );
}
