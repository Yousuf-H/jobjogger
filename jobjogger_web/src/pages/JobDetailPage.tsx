import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchJob } from '@/services/api/jobs'
import { JobTabs } from '@/components/job/JobTabs'
import { TypographyH1, TypographyP } from '@/components/ui/typography'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function JobDetailPage() {
  const { id } = useParams()

  const { data, isLoading, error } = useQuery({
    queryKey: ['jobs', id],
    queryFn: () => fetchJob(Number(id)),
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  type StatusVariant =
    | 'success'
    | 'destructive'
    | 'warning'
    | 'secondary'
    | 'outline'

  function getStatusVariant(status: string): StatusVariant {
    switch (status) {
      case 'offer':
      case 'accepted':
        return 'success'

      case 'rejected':
      case 'ghosted':
        return 'destructive'

      case 'interviewing':
      case 'phone_screen':
        return 'secondary'

      case 'applied':
        return 'warning'

      case 'wishlist':
      case 'withdrawn':
        return 'outline'

      default:
        return 'secondary'
    }
  }

  return (
    <div className="page-container">
      <Card className="mb-6 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <TypographyH1 className="mb-0">
                {data?.job.company_name}
              </TypographyH1>
              <TypographyP className="text-muted-foreground !mt-0 text-xl font-medium">
                {data?.job.job_title}
              </TypographyP>
            </div>
            <Badge
              variant={getStatusVariant(data?.job.status || '')}
              className="ml-4 rounded-full capitalize"
            >
              {data?.job.status?.replace('_', ' ') || ''}
            </Badge>
          </div>

          <Separator className="my-4" />

          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {data?.job.location && (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Location:</span>
                <Badge variant="outline" className="capitalize">
                  {data?.job.location}
                </Badge>
              </div>
            )}

            {data?.job.priority && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Priority:</span>
                <Badge variant="outline" className="capitalize">
                  {data?.job.priority}
                </Badge>
              </div>
            )}
          </div>

          {data?.job.tags && data?.job.tags.length > 0 && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Tags:</span>
              <div className="flex flex-wrap gap-2">
                {data?.job.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="capitalize">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {data?.job && (
        <JobTabs
          job={data.job}
          timelineEntries={data?.timeline_entries || []}
        />
      )}
    </div>
  )
}
