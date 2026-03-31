import { ThemeOption } from '@/components/settings/ThemeOption'
import { Card, CardContent } from '@/components/ui/card'
import { usePageTitle } from '@/hooks/usePageTitle'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function SettingsPage() {
  usePageTitle('Settings')
  const { theme, setTheme } = useTheme()

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your preferences.
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
    </div>
  )
}
