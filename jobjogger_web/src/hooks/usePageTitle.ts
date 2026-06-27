import { useEffect } from 'react'

/**
 * Sets the browser tab title for the current page.
 *
 * Appends `" | JobJogger"` to the supplied title. Falls back to
 * `"JobJogger — Never lose track"` when `title` is an empty string.
 * The effect re-runs whenever `title` changes.
 *
 * @param title - The page-specific portion of the tab title (e.g. `"Jobs"`, `"ACME Corp"`).
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title
      ? `${title} | JobJogger`
      : 'JobJogger — Never lose track'
  }, [title])
}
