import Footer from '@/components/layout/Footer'
import { TypographyH2 } from '@/components/ui/typography'
import SigninForm from '@/components/user/SigninForm'
import { usePageTitle } from '@/hooks/usePageTitle'
import { Award, BarChart3, TrendingUp } from 'lucide-react'

export default function SigninPage() {
  usePageTitle('Sign in')
  return (
    <div className="grid min-h-svh lg:grid-cols-5">
      <div className="bg-primary relative hidden overflow-hidden lg:col-span-2 lg:flex lg:flex-col">
        <div className="from-primary via-primary to-primary/80 absolute inset-0 bg-gradient-to-b" />

        <div className="relative flex h-full flex-col justify-between p-10">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-white/20">
              <span className="text-[11px] font-bold tracking-tight text-white">JJ</span>
            </div>
            <span className="text-primary-foreground text-lg font-semibold">
              JobJogger
            </span>
          </div>

          {/* Tagline */}
          <div className="space-y-6">
            <div className="space-y-3">
              <TypographyH2 className="text-primary-foreground border-0 pb-0 text-3xl font-bold leading-tight">
                Welcome back.
                <br />
                Let's keep the momentum.
              </TypographyH2>
              <p className="text-primary-foreground/60 max-w-sm text-sm leading-relaxed">
                Sign in to track your applications, monitor interviews, and stay
                on top of your job search.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
                  <BarChart3 className="text-primary-foreground h-5 w-5" />
                </div>
                <div>
                  <p className="text-primary-foreground text-sm font-medium">
                    Pipeline overview
                  </p>
                  <p className="text-primary-foreground/50 text-xs">
                    See where every application stands
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
                  <TrendingUp className="text-primary-foreground h-5 w-5" />
                </div>
                <div>
                  <p className="text-primary-foreground text-sm font-medium">
                    Response analytics
                  </p>
                  <p className="text-primary-foreground/50 text-xs">
                    Track your response and interview rates
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
                  <Award className="text-primary-foreground h-5 w-5" />
                </div>
                <div>
                  <p className="text-primary-foreground text-sm font-medium">
                    Timeline tracking
                  </p>
                  <p className="text-primary-foreground/50 text-xs">
                    Every status change, interview, and follow-up logged
                  </p>
                </div>
              </div>
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
          <SigninForm />
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-6">
          <Footer />
        </div>
      </div>
    </div>
  )
}
