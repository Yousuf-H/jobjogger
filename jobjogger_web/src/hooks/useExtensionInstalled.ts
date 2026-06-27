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

/**
 * Detects whether the JobJogger Chrome extension is installed in the current browser.
 *
 * Sends a `PING` message to the extension ID from `VITE_EXTENSION_ID`. If the
 * extension responds with `{ pong: true }` it is considered installed.
 *
 * Returns `null` while the check is in progress (i.e. on the initial render),
 * then settles to `true` or `false`. Components should treat `null` as "unknown"
 * and avoid rendering install prompts until it resolves.
 *
 * @returns `true` if installed, `false` if not, `null` while detecting.
 */
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
