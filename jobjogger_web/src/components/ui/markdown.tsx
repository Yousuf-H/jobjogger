import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'

function normalizeUrl(url?: string): string {
  if (!url) return '#'

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  if (url.startsWith('//')) {
    return `https:${url}`
  }

  return `https://${url}`
}

const markdownComponents: Components = {
  a: (props) => (
    <a
      {...props}
      href={normalizeUrl(props.href)}
      className="text-blue-600 hover:underline dark:text-blue-400"
      target="_blank"
      rel="noopener noreferrer"
    />
  ),
  h1: (props) => <h1 {...props} className="mb-4 mt-6 text-2xl font-bold" />,
  h2: (props) => <h2 {...props} className="mb-3 mt-5 text-xl font-bold" />,
  h3: (props) => <h3 {...props} className="mb-2 mt-4 text-lg font-bold" />,
  ul: (props) => (
    <ul {...props} className="my-2 list-inside list-disc space-y-1" />
  ),
  ol: (props) => (
    <ol {...props} className="my-2 list-inside list-decimal space-y-1" />
  ),
  p: (props) => <p {...props} className="my-2" />,
  strong: (props) => <strong {...props} className="font-bold" />,
  em: (props) => <em {...props} className="italic" />,
  code: (props) => (
    <code
      {...props}
      className="bg-muted rounded px-1.5 py-0.5 font-mono text-sm"
    />
  ),
}

interface MarkdownProps {
  children: string
}

export function Markdown({ children }: MarkdownProps) {
  return (
    <ReactMarkdown components={markdownComponents}>{children}</ReactMarkdown>
  )
}
