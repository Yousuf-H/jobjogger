import { Card, CardContent } from '@/components/ui/card'
import { TypographyH2 } from '@/components/ui/typography'
import { AlertCircle } from 'lucide-react'

interface PageErrorProps {
  message?: string
  title?: string
}

export function PageError({
  title = 'Something went wrong',
  message = 'Please try again later.',
}: PageErrorProps) {
  return (
    <div className="page-container">
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="bg-destructive/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
            <AlertCircle className="text-destructive h-5 w-5" />
          </div>
          <div>
            <TypographyH2 className="text-lg font-semibold border-0 pb-0">{title}</TypographyH2>
            <p className="text-muted-foreground mt-1 text-sm">{message}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
