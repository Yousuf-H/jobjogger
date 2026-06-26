import { useEffect, useState } from 'react'

const MOBILE_BREAKPOINT = 768

/**
 * Returns `true` when the viewport width is below the mobile breakpoint (768 px).
 *
 * Subscribes to a `MediaQueryList` change event so the value stays in sync if
 * the user resizes the window without a full page reload. Initialises
 * synchronously from `window.innerWidth` to avoid a layout flash on first render.
 *
 * @returns `true` on mobile-sized viewports, `false` on tablet/desktop.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    window.innerWidth < MOBILE_BREAKPOINT
  )

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
