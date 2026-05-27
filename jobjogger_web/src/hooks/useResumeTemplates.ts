import { fetchResumeTemplate, fetchResumeTemplates } from '@/services/api/resume'
import { useQuery } from '@tanstack/react-query'

export function useResumeTemplates() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return useQuery({
    queryKey: ['resume_templates', user.id],
    queryFn: fetchResumeTemplates,
  })
}

export function useResumeTemplate(id: number | undefined) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return useQuery({
    queryKey: ['resume_templates', user.id, id],
    queryFn: () => fetchResumeTemplate(id!),
    enabled: !!id,
  })
}
