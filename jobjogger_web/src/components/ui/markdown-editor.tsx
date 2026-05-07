import { Markdown } from '@/components/ui/markdown'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Edit3, Eye } from 'lucide-react'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  minHeight?: string
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write with markdown…',
  rows = 6,
  minHeight = '140px',
}: MarkdownEditorProps) {
  return (
    <Tabs defaultValue="write">
      <TabsList className="grid w-full grid-cols-2 h-8 mb-2">
        <TabsTrigger value="write" className="gap-1.5 text-xs">
          <Edit3 className="h-3.5 w-3.5" />
          Write
        </TabsTrigger>
        <TabsTrigger value="preview" className="gap-1.5 text-xs">
          <Eye className="h-3.5 w-3.5" />
          Preview
        </TabsTrigger>
      </TabsList>

      <TabsContent value="write" className="mt-0">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="font-mono text-sm resize-y"
          style={{ minHeight }}
        />
      </TabsContent>

      <TabsContent value="preview" className="mt-0">
        <div
          className="border rounded-md px-3 py-2 text-sm overflow-auto"
          style={{ minHeight }}
        >
          {value.trim() ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <Markdown>{value}</Markdown>
            </div>
          ) : (
            <p className="text-muted-foreground italic text-sm">Nothing to preview yet.</p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
