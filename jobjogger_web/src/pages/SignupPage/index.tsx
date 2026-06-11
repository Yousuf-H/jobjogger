import Footer from '@/components/layout/Footer'
import { TypographyH2 } from '@/components/ui/typography'
import SignupForm from '@/components/user/SignupForm'
import { usePageTitle } from '@/hooks/usePageTitle'
import { CheckCircle2 } from 'lucide-react'

export default function SignupPage() {
  usePageTitle('Sign up')
  const benefits = [
    'Track unlimited job applications',
    'Monitor your response and interview rates',
    'Timeline for every status change and interaction',
    'Notes with markdown for interview prep',
    'Pipeline analytics and source performance',
  ]

  return (
    <div className="grid min-h-svh lg:grid-cols-5">
      <div className="bg-primary relative hidden overflow-hidden lg:col-span-2 lg:flex lg:flex-col">
        <div className="from-primary via-primary to-primary/80 absolute inset-0 bg-gradient-to-b" />

        <div className="relative flex h-full flex-col justify-between p-10">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-white/20">
              <span className="text-[11px] font-bold tracking-tight text-white">JJ</span>
            </div>
            <span className="text-primary-foreground text-lg font-semibold">
              JobJogger
            </span>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <TypographyH2 className="text-primary-foreground border-0 pb-0 text-3xl font-bold leading-tight">
                Your job search,
                <br />
                finally organised.
              </TypographyH2>
              <p className="text-primary-foreground/60 max-w-sm text-sm leading-relaxed">
                Join JobJogger to stay on top of every application, interview,
                and follow-up — all in one place.
              </p>
            </div>

            <div className="space-y-3">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm"
                >
                  <CheckCircle2 className="text-primary-foreground/70 h-4 w-4 shrink-0" />
                  <p className="text-primary-foreground text-sm">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-primary-foreground/30 text-xs">jobjogger.com</p>
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center px-6 py-12 lg:col-span-3">
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="bg-primary flex size-8 items-center justify-center rounded-lg">
            <span className="text-[11px] font-bold tracking-tight text-white">JJ</span>
          </div>
          <span className="text-lg font-semibold">JobJogger</span>
        </div>

        <div className="w-full max-w-sm">
          <SignupForm />
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-6">
          <Footer />
        </div>
      </div>
    </div>
  )
}
