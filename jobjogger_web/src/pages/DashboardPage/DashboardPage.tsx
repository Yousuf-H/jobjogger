import { DataTable } from '@/pages/DashboardPage/DataTable'
import { columns as createColumns } from '@/pages/DashboardPage/columns'
import { useNavigate } from 'react-router-dom'
import type { Job } from '@/types/job'
import { TypographyH3 } from '@/components/ui/typography'
import CreateJobDialog from '@/components/job/CreateJobDialog'
import { Button } from '@/components/ui/button'
import { useJobs } from '@/hooks/useJobs'
import { useJobActions } from '@/hooks/useJobActions'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading, error } = useJobs()
  const { archiveMutation, unarchiveMutation, deleteMutation, handleView } =
    useJobActions()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="page-container">
      <div className="page-header mb-4 flex items-center justify-between">
        <TypographyH3>Jobs</TypographyH3>
        <CreateJobDialog />
      </div>

      <div className="space-y-4">
        <DataTable
          columns={createColumns(
            handleView,
            archiveMutation.mutate,
            unarchiveMutation.mutate,
            deleteMutation.mutate
          )}
          data={data?.slice(0, 10) || []}
          onRowClick={(row) => handleView((row as Job).id)}
        />

        <div className="flex flex-col items-start gap-4">
          <Button
            className="cursor-pointer"
            variant="outline"
            onClick={() => navigate('/jobs')}
          >
            View All Jobs →
          </Button>
        </div>
      </div>
    </div>
  )
}
