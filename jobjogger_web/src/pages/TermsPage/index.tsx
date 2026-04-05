import { usePageTitle } from '@/hooks/usePageTitle'
import { Briefcase } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function TermsPage() {
  usePageTitle('Terms & Conditions')

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
              Terms &amp; Conditions
            </h1>
            <p className="text-muted-foreground text-sm">
              Last updated: April 2026
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By creating an account or using Job Jogger, you agree to be bound
              by these Terms &amp; Conditions. If you do not agree, please do
              not use the service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Job Jogger is a job application tracking tool that helps you
              organise and monitor your job search. We provide the platform
              as-is and reserve the right to modify or discontinue features with
              reasonable notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. Your Account</h2>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for maintaining the security of your account
              credentials. You must not share your password or allow others to
              access your account. Notify us immediately if you suspect
              unauthorised access. We reserve the right to suspend accounts that
              violate these terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree not to:
            </p>
            <ul className="text-muted-foreground list-disc space-y-1 pl-6 leading-relaxed">
              <li>Use the service for any unlawful purpose</li>
              <li>
                Attempt to gain unauthorised access to any part of the service
              </li>
              <li>
                Interfere with or disrupt the integrity or performance of the
                service
              </li>
              <li>
                Scrape or extract data from the Job Jogger service in an
                unauthorised or automated manner
              </li>
              <li>Impersonate another person or entity</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. Your Data</h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain ownership of the data you enter into Job Jogger. By
              using the service, you grant us a limited licence to store and
              process your data solely for the purpose of providing the service
              to you. See our{' '}
              <Link
                to="/privacy-policy"
                className="text-primary hover:underline"
              >
                Privacy Policy
              </Link>{' '}
              for full details.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. Availability</h2>
            <p className="text-muted-foreground leading-relaxed">
              We aim for high availability but do not guarantee uninterrupted
              access to the service. We may perform maintenance that temporarily
              affects availability, and will endeavour to minimise disruption.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">
              7. Limitation of Liability
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Job Jogger is provided "as is" without warranties of any kind,
              express or implied. To the maximum extent permitted by law, we are
              not liable for any indirect, incidental, or consequential damages
              arising from your use of the service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">8. Account Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              You may delete your account at any time from your account
              settings. We may suspend or terminate accounts that violate these
              terms. Upon termination, your data will be deleted in accordance
              with our Privacy Policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">9. Changes to These Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these terms from time to time. Continued use of the
              service after changes constitutes acceptance of the updated terms.
              We'll notify you of significant changes by email.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">10. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Questions about these terms? Reach us at{' '}
              <a
                href="mailto:hello@jobjogger.com"
                className="text-primary hover:underline"
              >
                hello@jobjogger.com
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">11. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These terms are governed by the laws of Victoria, Australia. Any
              disputes arising from these terms will be subject to the exclusive
              jurisdiction of the courts of Victoria.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t px-6 py-6 text-center">
        <p className="text-muted-foreground text-xs">
          &copy; {new Date().getFullYear()} Job Jogger &middot;{' '}
          <Link
            to="/privacy-policy"
            className="hover:text-foreground underline underline-offset-4 transition-colors"
          >
            Privacy Policy
          </Link>
        </p>
      </footer>
    </div>
  )
}
