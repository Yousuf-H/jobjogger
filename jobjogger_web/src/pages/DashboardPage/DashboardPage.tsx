import { useQuery } from '@tanstack/react-query'
import { fetchJobs } from '@/services/api/jobs'
import { DataTable } from '@/pages/DashboardPage/DataTable'
import { columns } from '@/pages/DashboardPage/columns'
import { useNavigate } from 'react-router-dom'
import type { Job } from '@/types/job'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => fetchJobs()
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
  <div className="p-8">
    <h1 className="text-2xl font-bold mb-6">Jobs</h1>

    <div className="space-y-4">
      <DataTable columns={columns} data={data || []} onRowClick={(row) => navigate(`/jobs/${(row as Job).id}`)} />
    </div>
  </div>
  )
}