import { analyseResume, type ResumeMatchResult } from '@/services/api/jobs'
import { getCurrentUserId } from '@/lib/auth'
import { invalidateJobQueries } from '@/lib/invalidation'
import { useMutation, useQueryClient } from '@tanstack/react-query'

/**
 * Mutation hook that triggers AI match analysis for a job's linked resume.
 *
 * POSTs to `/api/v1/jobs/:jobId/analyse_resume` with no request body.
 * On success, invalidates the job detail query so the persisted analysis
 * is reflected in the job data on next render without a manual refresh.
 *
 * @param jobId - The job to analyse.
 * @returns A TanStack `UseMutationResult` whose `data` is a `ResumeMatchResult` on success.
 */
export function useAnalyseResume(jobId: number) {
  const queryClient = useQueryClient()
  const userId = getCurrentUserId()

  return useMutation<ResumeMatchResult, Error>({
    mutationFn: () => analyseResume(jobId),
    onSuccess: () => {
      invalidateJobQueries(queryClient, userId)
    },
  })
}

export type { ResumeMatchResult }
