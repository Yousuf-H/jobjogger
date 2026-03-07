import TurndownService from 'turndown'

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
})

export function convertToMarkdown(html: string): string {
  // If it's already plain text, try to detect patterns
  if (!html.includes('<')) {
    return autoFormatPlainText(html)
  }

  // If it's HTML (from copy-paste), convert to markdown
  return turndownService.turndown(html)
}

function autoFormatPlainText(text: string): string {
  let formatted = text

  // Detect headers (lines that end with colon or are all caps)
  formatted = formatted.replace(/^([A-Z][A-Za-z\s]+):$/gm, '## $1')

  // Detect bullet points (lines starting with - or •)
  formatted = formatted.replace(/^[-•]\s+(.+)$/gm, '- $1')

  // Add spacing between paragraphs
  formatted = formatted.replace(/\n\n/g, '\n\n')

  return formatted
}
