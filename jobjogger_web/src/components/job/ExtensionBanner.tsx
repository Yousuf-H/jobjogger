import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useExtensionInstalled } from '@/hooks/useExtensionInstalled'
import { PuzzleIcon, X } from 'lucide-react'
import { useState } from 'react'

const EXTENSION_URL = 'https://chrome.google.com/webstore/detail/jobjogger'

export function ExtensionBanner() {
  const { user } = useAuth()
  const installed = useExtensionInstalled()
  const [dismissed, setDismissed] = useState(
    () =>
      localStorage.getItem(`extension_banner_dismissed_${user?.id}`) === 'true'
  )

  console.log(user?.id)

  const isChrome =
    /Chrome/.test(navigator.userAgent) && !/Edg/.test(navigator.userAgent)

  if (installed || dismissed || !isChrome || installed === null) return null

  const handleDismiss = () => {
    localStorage.setItem(`extension_banner_dismissed_${user?.id}`, 'true')
    setDismissed(true)
  }

  return (
    <div className="bg-primary/5 border-primary/10 flex items-center gap-3 rounded-lg border px-4 py-3">
      <div className="bg-primary/10 flex size-8 shrink-0 items-center justify-center rounded-md">
        <PuzzleIcon className="text-primary h-4 w-4" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
        <p className="text-foreground text-sm font-medium">
          Save jobs from Seek in one click
        </p>
        <p className="text-muted-foreground hidden text-sm sm:block">—</p>

        <a
          href={EXTENSION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary text-sm font-medium hover:underline"
        >
          Add the JobJogger Chrome extension
        </a>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground ml-auto shrink-0"
        onClick={handleDismiss}
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
