import { useEffect } from 'react'

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title
      ? `${title} | JobJogger`
      : 'JobJogger — Never lose track'
  }, [title])
}
