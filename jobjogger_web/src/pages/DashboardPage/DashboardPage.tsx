import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { archiveJob, deleteJob, fetchJobs } from '@/services/api/jobs'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
import { DataTable } from '@/pages/DashboardPage/DataTable'
import { columns as createColumns } from '@/pages/DashboardPage/columns'
import { useNavigate } from 'react-router-dom'
import type { Job } from '@/types/job'
import { TypographyH3 } from '@/components/ui/typography'
import CreateJobDialog from '@/components/job/CreateJobDialog'

export default function DashboardPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => fetchJobs(),
  })

  const archiveMutation = useMutation({
    mutationFn: archiveJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Job Archived Successfully!')
    },
    onError: (error: AxiosError<{ errors: string[] }>) => {
      const message =
        error.response?.data?.errors?.[0] || 'Failed to archive this job'
      toast.error(message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Job Deleted Successfully!')
    },
    onError: (error: AxiosError<{ errors: string[] }>) => {
      const message =
        error.response?.data?.errors?.[0] || 'Failed to delete this job'
      toast.error(message)
    },
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="page-container">
      <div className="page-header flex items-center justify-between">
        <TypographyH3 className="page-title">Jobs</TypographyH3>
        <CreateJobDialog />
      </div>

      <div className="space-y-4">
        <DataTable
          columns={createColumns(archiveMutation.mutate, deleteMutation.mutate)}
          data={data || []}
          onRowClick={(row) => navigate(`/jobs/${(row as Job).id}`)}
        />
      </div>
    </div>
  )
}
