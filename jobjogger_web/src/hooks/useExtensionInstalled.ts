import { useEffect, useState } from 'react'

const EXTENSION_ID = import.meta.env.VITE_EXTENSION_ID

interface ChromeRuntime {
  sendMessage: (
    id: string,
    message: { type: string },
    callback: (response: { pong: boolean } | undefined) => void
  ) => void
}

interface ChromeWindow {
  runtime?: ChromeRuntime
}

export function useExtensionInstalled(): boolean | null {
  const [installed, setInstalled] = useState<boolean | null>(null)

  useEffect(() => {
    const chromeWindow = (window as Window & { chrome?: ChromeWindow }).chrome

    if (!chromeWindow?.runtime || !EXTENSION_ID) {
      setTimeout(() => setInstalled(false), 0)
      return
    }

    try {
      chromeWindow.runtime.sendMessage(
        EXTENSION_ID,
        { type: 'PING' },
        (response) => {
          setInstalled(!!response?.pong)
        }
      )
    } catch {
      setTimeout(() => setInstalled(false), 0)
    }
  }, [])

  return installed
}
