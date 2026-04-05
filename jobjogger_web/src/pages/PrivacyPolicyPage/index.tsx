import { usePageTitle } from '@/hooks/usePageTitle'
import { Briefcase } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PrivacyPolicyPage() {
  usePageTitle('Privacy Policy')

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link to="/signin" className="flex items-center gap-2">
            <div className="bg-primary flex size-8 items-center justify-center rounded-lg">
              <Briefcase className="text-primary-foreground h-4 w-4" />
            </div>
            <span className="text-lg font-semibold">Job Jogger</span>
          </Link>
          <Link
            to="/signin"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            &larr; Back to sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-sm">
              Last updated: April 2026
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Job Jogger. We respect your privacy and are committed
              to protecting your personal data. This policy explains what
              information we collect, how we use it, and your rights in relation
              to it.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information you provide directly when you create an
              account and use the service:
            </p>
            <ul className="text-muted-foreground list-disc space-y-1 pl-6 leading-relaxed">
              <li>
                <strong className="text-foreground">Account information</strong>{' '}
                — your name and email address
              </li>
              <li>
                <strong className="text-foreground">
                  Job application data
                </strong>{' '}
                — companies, roles, statuses, notes, and timeline entries you
                record
              </li>
              <li>
                <strong className="text-foreground">Usage data</strong> — basic
                analytics such as pages visited and features used, to help us
                improve the product
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell your data to third parties, ever.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. Chrome Extension</h2>
            <p className="text-muted-foreground leading-relaxed">
              The JobJogger Chrome extension reads the content of Seek job
              listing pages you choose to save. This includes job title, company
              name, location, salary, employment type, and job description. This
              data is sent to your JobJogger account and is not shared with any
              third parties. The extension does not track your browsing history
              or collect any data beyond the job listing page you explicitly
              choose to save.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">
              4. How We Use Your Information
            </h2>
            <ul className="text-muted-foreground list-disc space-y-1 pl-6 leading-relaxed">
              <li>To provide and maintain the Job Jogger service</li>
              <li>To authenticate you and keep your account secure</li>
              <li>To respond to support requests</li>
              <li>
                To send important service updates (not marketing, unless you opt
                in)
              </li>
              <li>To improve the product based on aggregated usage patterns</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">
              5. Data Storage & Security
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data is stored securely. Passwords are hashed and never
              stored in plain text. We use HTTPS for all data in transit. We
              take reasonable precautions to protect your information from
              unauthorised access, use, or disclosure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use HTTP-only cookies solely for authentication purposes. We do
              not use tracking or advertising cookies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">7. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to:
            </p>
            <ul className="text-muted-foreground list-disc space-y-1 pl-6 leading-relaxed">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your account and all associated data</li>
              <li>Export your job application data</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              To exercise any of these rights, contact us at the email below.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">8. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              Job Jogger may use third-party services for infrastructure (such
              as hosting). These providers are carefully selected and are
              contractually required to keep your data secure and confidential.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">9. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this policy from time to time. When we do, we'll
              update the date at the top of this page. For significant changes,
              we'll notify you by email.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">10. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please
              contact us at{' '}
              <a
                href="mailto:privacy@jobjogger.com"
                className="text-primary hover:underline"
              >
                privacy@jobjogger.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t px-6 py-6 text-center">
        <p className="text-muted-foreground text-xs">
          &copy; {new Date().getFullYear()} Job Jogger &middot;{' '}
          <Link
            to="/terms"
            className="hover:text-foreground underline underline-offset-4 transition-colors"
          >
            Terms &amp; Conditions
          </Link>
        </p>
      </footer>
    </div>
  )
}
