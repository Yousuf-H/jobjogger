import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

function ThemeOption({
  value,
  current,
  icon: Icon,
  label,
  description,
  onSelect,
}: {
  value: string
  current: string | undefined
  icon: React.ElementType
  label: string
  description: string
  onSelect: (value: string) => void
}) {
  const isActive = current === value

  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        'flex flex-col items-center gap-3 rounded-xl border p-6 text-center transition-colors',
        isActive
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 bg-card'
      )}
    >
      <div
        className={cn(
          'flex size-12 items-center justify-center rounded-full',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'bg-muted text-muted-foreground'
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-muted-foreground mt-1 text-xs">{description}</p>
      </div>
    </button>
  )
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your account and preferences.
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Appearance</h2>
            <p className="text-muted-foreground text-sm">
              Choose how JobJogger looks for you.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ThemeOption
              value="light"
              current={theme}
              icon={Sun}
              label="Light"
              description="Clean and bright"
              onSelect={setTheme}
            />
            <ThemeOption
              value="dark"
              current={theme}
              icon={Moon}
              label="Dark"
              description="Easy on the eyes"
              onSelect={setTheme}
            />
            <ThemeOption
              value="system"
              current={theme}
              icon={Monitor}
              label="System"
              description="Match your device"
              onSelect={setTheme}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Profile</h2>
            <p className="text-muted-foreground text-sm">
              Update your personal information.
            </p>
          </div>

          <p className="text-muted-foreground text-sm">Coming soon.</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-destructive text-lg font-semibold">
              Danger zone
            </h2>
            <p className="text-muted-foreground text-sm">
              Irreversible actions for your account.
            </p>
          </div>

          <Button variant="destructive" disabled>
            Delete account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
