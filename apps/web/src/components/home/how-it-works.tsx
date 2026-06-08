import { Badge } from "@gitpilot/ui";

const steps = [
  {
    step: "01",
    title: "Install the extension",
    description: "Add GitPilot to Chrome in one click from the Web Store.",
  },
  {
    step: "02",
    title: "Create a free account",
    description: "Sign up with email or GitHub. No credit card required.",
  },
  {
    step: "03",
    title: "Open GitHub and generate",
    description:
      "A ✨ button appears on commit and PR pages. Click it and your message is written.",
  },
];

export function HowItWorks() {
  return (
    <section id='how-it-works' className='px-6 py-24'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-16 text-center'>
          <Badge className='mb-4'>How it works</Badge>
          <h2 className='text-4xl font-bold text-white'>
            Up and running in 2 minutes
          </h2>
        </div>

        <div className='grid gap-8 md:grid-cols-3'>
          {steps.map((step, i) => (
            <div
              key={step.step}
              className='relative flex flex-col items-center text-center'
            >
              {i < steps.length - 1 && (
                <div className='absolute left-[calc(50%+2rem)] top-7 hidden h-px w-[calc(100%-4rem)] bg-gradient-to-r from-zinc-700 to-transparent md:block' />
              )}
              <div className='mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-violet-500/30 bg-violet-600/10 text-lg font-bold text-violet-400'>
                {step.step}
              </div>
              <h3 className='mb-2 font-semibold text-white'>{step.title}</h3>
              <p className='text-sm text-zinc-400 leading-relaxed'>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
