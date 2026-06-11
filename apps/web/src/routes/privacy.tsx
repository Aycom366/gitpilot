import { createFileRoute, Link } from "@tanstack/react-router";
import { GitCommitHorizontal } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
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
        <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>

        <div className="space-y-8 text-zinc-300 leading-relaxed">
          <p>
            GitPilot ("we", "our", or "the extension") is a Chrome browser
            extension and web dashboard that generates commit messages, pull
            request titles, and descriptions from your code changes using AI.
            This policy explains what data we handle and how we handle it.
          </p>

          <Section title="1. What data GitPilot accesses">
            <Subsection title="Code diffs">
              When you click ✨ Generate, GitPilot reads only the diff of the
              file you are currently editing — the changes between the original
              version and your current edits. This diff is sent to an AI
              provider to generate a commit message or PR description.
            </Subsection>
            <Subsection title="Authentication token">
              GitPilot stores a JWT authentication token in{" "}
              <code className="bg-zinc-800 px-1 rounded text-sm">
                chrome.storage.local
              </code>{" "}
              to keep you logged in. This is stored only in your local browser
              and is never transmitted except to our API server to authenticate
              your requests.
            </Subsection>
            <Subsection title="API key (BYOK users only)">
              If you provide your own AI API key, it is encrypted with
              AES-256-GCM before being stored. It is decrypted only at request
              time and is never logged or exposed.
            </Subsection>
          </Section>

          <Section title="2. What GitPilot does not access">
            <ul className="list-disc list-inside space-y-1 text-zinc-400">
              <li>Your full git history or repository contents</li>
              <li>Files you have not actively opened for editing</li>
              <li>Your GitHub or Azure DevOps credentials or tokens</li>
              <li>
                Any pages outside of{" "}
                <code className="bg-zinc-800 px-1 rounded text-sm">
                  github.com
                </code>{" "}
                and{" "}
                <code className="bg-zinc-800 px-1 rounded text-sm">
                  dev.azure.com
                </code>
              </li>
              <li>Your browsing history</li>
              <li>
                Any personal information beyond the email address used to create
                your account
              </li>
            </ul>
          </Section>

          <Section title="3. How data is used">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-2 pr-4 text-zinc-300 font-medium">
                    Data
                  </th>
                  <th className="text-left py-2 pr-4 text-zinc-300 font-medium">
                    Purpose
                  </th>
                  <th className="text-left py-2 text-zinc-300 font-medium">
                    Stored on server?
                  </th>
                </tr>
              </thead>
              <tbody className="text-zinc-400 divide-y divide-zinc-800">
                <tr>
                  <td className="py-2 pr-4">Code diff</td>
                  <td className="py-2 pr-4">
                    Sent to AI provider to generate output
                  </td>
                  <td className="py-2">No — in-flight only</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Email address</td>
                  <td className="py-2 pr-4">Account creation and login</td>
                  <td className="py-2">Yes</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">JWT token</td>
                  <td className="py-2 pr-4">Authenticate API requests</td>
                  <td className="py-2">No — browser only</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">API key (BYOK)</td>
                  <td className="py-2 pr-4">Route to your AI provider</td>
                  <td className="py-2">Yes, encrypted</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Generation metadata</td>
                  <td className="py-2 pr-4">
                    Usage analytics (type, provider, token counts — no content)
                  </td>
                  <td className="py-2">Yes, 90-day retention</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section title="4. Third-party AI providers">
            <p className="mb-3">
              Depending on your plan and settings, your code diff may be sent to
              one of the following providers:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400">
              <li>
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300"
                >
                  Google Gemini — Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="https://www.anthropic.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300"
                >
                  Anthropic Claude — Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="https://openai.com/policies/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300"
                >
                  OpenAI — Privacy Policy
                </a>
              </li>
            </ul>
            <p className="mt-3 text-zinc-400">
              In all cases the diff is sent directly to the provider's API and
              is not persisted by GitPilot.
            </p>
          </Section>

          <Section title="5. Data retention and deletion">
            <p>
              Your account data is retained while your account is active.
              Generation metadata is retained for 90 days then deleted. You can
              delete your account at any time from{" "}
              <Link
                to="/dashboard/settings"
                className="text-violet-400 hover:text-violet-300"
              >
                Settings → Danger Zone
              </Link>
              . This immediately wipes your credentials and soft-deletes your
              account; a permanent hard delete runs within 30 days.
            </p>
          </Section>

          <Section title="6. Security">
            <ul className="list-disc list-inside space-y-1 text-zinc-400">
              <li>All communication uses HTTPS</li>
              <li>JWT tokens are short-lived and refreshed automatically</li>
              <li>
                API keys are encrypted with AES-256-GCM; the encryption key is
                stored separately from the ciphertext
              </li>
            </ul>
          </Section>

          <Section title="7. Children">
            <p>
              GitPilot is not directed at children under 13 and does not
              knowingly collect information from children under 13.
            </p>
          </Section>

          <Section title="8. Changes">
            <p>
              We may update this policy. We will revise the "Last updated" date
              at the top. Continued use after a change constitutes acceptance.
            </p>
          </Section>

          <Section title="9. Contact">
            <p>
              Questions?{" "}
              <a
                href="mailto:privacy@gitpilot.app"
                className="text-violet-400 hover:text-violet-300"
              >
                privacy@gitpilot.app
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

function Subsection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-zinc-200 mb-1">{title}</h3>
      <p className="text-zinc-400">{children}</p>
    </div>
  );
}
