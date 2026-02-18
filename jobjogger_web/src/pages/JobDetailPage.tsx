import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchJob } from '@/services/api/jobs'

export default function JobDetailPage() {
  const { id } = useParams()

  const { data, isLoading, error } = useQuery({
    queryKey: ['jobs', id],
    queryFn: () => fetchJob(Number(id))
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h1>Job Detail</h1>
      {data && (
        <div>
          <h2>{data.job.company_name}</h2>
          <p>{data.job.status}</p>
        </div>
      )}
    </div>
  )
}