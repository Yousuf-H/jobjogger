import SigninForm from '@/components/user/SigninForm'
import { usePageTitle } from '@/hooks/usePageTitle'
import { IconAward, IconChartBar, IconTrendingUp } from '@tabler/icons-react'

const features = [
  {
    Icon: IconChartBar,
    title: 'Pipeline overview',
    desc: 'See where every application stands',
  },
  {
    Icon: IconTrendingUp,
    title: 'Response analytics',
    desc: 'Track your response and interview rates',
  },
  {
    Icon: IconAward,
    title: 'Timeline tracking',
    desc: 'Every status change, interview, and follow-up logged',
  },
]

export default function SigninPage() {
  usePageTitle('Sign in')

  return (
    <div className="flex min-h-svh">
      {/* Left panel — gradient brand column */}
      <div
        className="relative hidden overflow-hidden lg:flex lg:flex-col"
        style={{
          width: '45%',
          flexShrink: 0,
          background: 'linear-gradient(155deg, #2C7BC4 0%, #185FA5 55%, #0C447C 100%)',
        }}
      >
        {/* Decorative circles */}
        <div
          className="pointer-events-none absolute"
          style={{
            width: 220,
            height: 220,
            top: -60,
            right: -60,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
          }}
        />
        <div
          className="pointer-events-none absolute"
          style={{
            width: 140,
            height: 140,
            bottom: 40,
            right: -40,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }}
        />

        {/* Content: logo top, rest bottom, footer at very bottom */}
        <div
          className="relative flex h-full flex-col justify-between"
          style={{ padding: '48px 40px' }}
        >
          {/* Logo lockup */}
          <div className="flex items-center gap-2">
            <div
              className="flex shrink-0 items-center justify-center"
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: 'rgba(255,255,255,0.18)',
              }}
            >
              <span className="text-[11px] font-bold tracking-tight text-white">JJ</span>
            </div>
            <span className="text-white" style={{ fontSize: 16, fontWeight: 500 }}>
              JobJogger
            </span>
          </div>

          {/* Main content block */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h1
                className="text-white"
                style={{ fontSize: 32, fontWeight: 500, lineHeight: 1.25 }}
              >
                Welcome back. Let's keep the momentum.
              </h1>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.78)', maxWidth: 320 }}
              >
                Sign in to track your applications, monitor interviews, and stay on top of your
                job search.
              </p>
            </div>

            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
              Joining 2,400+ job seekers staying organised
            </p>

            <div className="space-y-3">
              {features.map(({ Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex items-center gap-3"
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    padding: '12px 14px',
                    borderRadius: 10,
                  }}
                >
                  <div
                    className="flex shrink-0 items-center justify-center"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'rgba(255,255,255,0.16)',
                    }}
                  >
                    <Icon size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white" style={{ fontSize: 13, fontWeight: 500 }}>
                      {title}
                    </p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>jobjogger.com</p>
        </div>
      </div>

      {/* Right panel — white form column */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 dark:bg-card">
        {/* Mobile logo — shown only when left panel is hidden */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="bg-primary flex size-8 items-center justify-center rounded-lg">
            <span className="text-[11px] font-bold tracking-tight text-white">JJ</span>
          </div>
          <span className="text-lg font-semibold">JobJogger</span>
        </div>

        <div style={{ width: '100%', maxWidth: 340 }}>
          <SigninForm />
        </div>
      </div>
    </div>
  )
}
