import { createFileRoute, Link } from "@tanstack/react-router";
import { GitCommitHorizontal } from "lucide-react";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Nav */}
      <nav className="border-b border-zinc-800 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <GitCommitHorizontal className="h-5 w-5 text-violet-400" />
            <span className="font-semibold text-white">GitPilot</span>
          </Link>
          <Link
            to="/"
            className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-14">
        <p className="text-sm text-zinc-500 mb-2">Last updated: June 2026</p>
        <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>

        <div className="space-y-8 text-zinc-300 leading-relaxed">
          <p>
            By installing the GitPilot browser extension or using the GitPilot
            web dashboard, you agree to these Terms of Service. If you do not
            agree, do not use GitPilot.
          </p>

          <Section title="1. The service">
            <p>
              GitPilot is a developer tool that generates commit messages, pull
              request descriptions, and related git context by sending code
              diffs to AI providers. GitPilot is provided "as is" with no
              guarantee that generated output will be accurate, complete, or
              suitable for your use case. You are responsible for reviewing and
              approving any generated content before committing or publishing
              it.
            </p>
          </Section>

          <Section title="2. Eligibility">
            <p>
              You must be at least 13 years old to use GitPilot. By using
              GitPilot you represent that you meet this requirement.
            </p>
          </Section>

          <Section title="3. Your account">
            <p>
              You are responsible for keeping your login credentials secure.
              You are responsible for all activity that occurs under your
              account. If you believe your account has been compromised, contact
              us immediately at{" "}
              <a
                href="mailto:support@gitpilot.app"
                className="text-violet-400 hover:text-violet-300"
              >
                support@gitpilot.app
              </a>
              .
            </p>
          </Section>

          <Section title="4. Acceptable use">
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400">
              <li>
                Use GitPilot to transmit code that you do not have the right to
                share
              </li>
              <li>
                Attempt to reverse-engineer, scrape, or abuse the GitPilot API
              </li>
              <li>
                Use GitPilot to send malicious, illegal, or harmful content to
                AI providers
              </li>
              <li>
                Share your API key or account credentials with others
              </li>
              <li>
                Circumvent rate limits through multiple accounts or automated
                means
              </li>
            </ul>
          </Section>

          <Section title="5. BYOK (Bring Your Own Key)">
            <p>
              If you provide a third-party API key (Google, Anthropic, or
              OpenAI), you are responsible for complying with that provider's
              terms of service. GitPilot encrypts and stores your key solely to
              route your generation requests. You may remove your key at any
              time from Settings.
            </p>
          </Section>

          <Section title="6. Free tier limits">
            <p>
              Free accounts are limited to 20 generations per day per
              generation type. We reserve the right to adjust these limits. We
              will notify users of significant changes.
            </p>
          </Section>

          <Section title="7. Intellectual property">
            <p>
              GitPilot does not claim ownership of the code diffs you submit or
              the generated output. Generated content is provided to you and we
              make no claim over it. GitPilot's name, logo, and website design
              are our intellectual property.
            </p>
          </Section>

          <Section title="8. Third-party AI providers">
            <p>
              Generated content is produced by third-party AI models (Google
              Gemini, Anthropic Claude, or OpenAI GPT). We are not responsible
              for the accuracy, completeness, or suitability of AI-generated
              output. Your use of those models is also subject to their
              respective terms of service.
            </p>
          </Section>

          <Section title="9. Disclaimers and limitation of liability">
            <p>
              GitPilot is provided "as is" without warranty of any kind,
              express or implied. We do not guarantee that the service will be
              uninterrupted or error-free. To the fullest extent permitted by
              law, GitPilot shall not be liable for any indirect, incidental,
              special, or consequential damages arising from your use of the
              service, including but not limited to loss of data, loss of
              revenue, or damage to code or repositories.
            </p>
          </Section>

          <Section title="10. Termination">
            <p>
              You may delete your account at any time from{" "}
              <Link
                to="/dashboard/settings"
                className="text-violet-400 hover:text-violet-300"
              >
                Settings → Danger Zone
              </Link>
              . We reserve the right to suspend or terminate accounts that
              violate these terms.
            </p>
          </Section>

          <Section title="11. Changes to these terms">
            <p>
              We may update these terms from time to time. We will update the
              "Last updated" date above. Continued use of GitPilot after a
              change constitutes acceptance of the updated terms.
            </p>
          </Section>

          <Section title="12. Governing law">
            <p>
              These terms are governed by applicable law. Any disputes shall be
              resolved in the courts of the jurisdiction where GitPilot is
              operated.
            </p>
          </Section>

          <Section title="13. Contact">
            <p>
              Questions about these terms?{" "}
              <a
                href="mailto:legal@gitpilot.app"
                className="text-violet-400 hover:text-violet-300"
              >
                legal@gitpilot.app
              </a>
            </p>
          </Section>
        </div>
      </main>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-zinc-800">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
