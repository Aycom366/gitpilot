import { Link } from "@tanstack/react-router";
import { Button, Badge, cn } from "@gitpilot/ui";
import { Check } from "lucide-react";

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    description: "For individuals getting started",
    features: [
      "10 generations / day per type",
      "Commit messages",
      "PR titles & descriptions",
      "Branch name suggestions",
      "Google Gemini Flash (default)",
      "GitHub support",
    ],
    cta: "Get started free",
    highlighted: false,
  },
  {
    name: "BYOK",
    price: "Free",
    description: "Bring your own API key",
    features: [
      "Unlimited generations",
      "All generation types",
      "Choose your provider",
      "Anthropic, OpenAI, or Google",
      "Encrypted key storage",
      "GitHub support",
    ],
    cta: "Connect your key",
    highlighted: true,
  },
];

export function Pricing() {
  return (
    <section id='pricing' className='px-6 py-24'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-16 text-center'>
          <Badge className='mb-4'>Pricing</Badge>
          <h2 className='text-4xl font-bold text-white'>
            Simple, transparent pricing
          </h2>
          <p className='mt-4 text-zinc-400'>
            Free to start. No hidden fees. No subscriptions.
          </p>
        </div>

        <div className='mx-auto grid max-w-3xl gap-6 md:grid-cols-2'>
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "relative rounded-xl border p-8",
                tier.highlighted
                  ? "border-violet-500/50 bg-violet-600/5 shadow-lg shadow-violet-950/30"
                  : "border-zinc-800 bg-zinc-900/60",
              )}
            >
              {tier.highlighted && (
                <div className='absolute -top-3 left-1/2 -translate-x-1/2'>
                  <Badge>Most popular</Badge>
                </div>
              )}
              <div className='mb-6'>
                <p className='text-sm font-medium text-zinc-400'>{tier.name}</p>
                <p className='mt-1 text-4xl font-bold text-white'>
                  {tier.price}
                </p>
                <p className='mt-1 text-sm text-zinc-500'>{tier.description}</p>
              </div>

              <ul className='mb-8 space-y-3'>
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className='flex items-center gap-3 text-sm text-zinc-300'
                  >
                    <Check className='h-4 w-4 flex-shrink-0 text-violet-400' />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link to='/auth/register'>
                <Button
                  variant={tier.highlighted ? "default" : "outline"}
                  size='lg'
                  className='w-full'
                >
                  {tier.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
