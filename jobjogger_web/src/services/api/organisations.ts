import type { Organisation } from '@/types/organisation'
import { apiClient } from './client'

export async function fetchOrganisations(): Promise<Organisation[]> {
  const response = await apiClient.get('/organisations')
  return response.data
}

export async function fetchOrganisation(id: number): Promise<Organisation> {
  const response = await apiClient.get(`/organisations/${id}`)
  return response.data
}

export async function createOrganisation(
  data: Partial<Organisation>
): Promise<Organisation> {
  const response = await apiClient.post('/organisations', { organisation: data })
  return response.data
}

export async function updateOrganisation(
  id: number,
  data: Partial<Organisation>
): Promise<Organisation> {
  const response = await apiClient.patch(`/organisations/${id}`, {
    organisation: data,
  })
  return response.data
}

export async function deleteOrganisation(id: number): Promise<void> {
  await apiClient.delete(`/organisations/${id}`)
}

export async function mergeOrganisation(
  duplicateId: number,
  targetId: number
): Promise<Organisation> {
  const response = await apiClient.patch(
    `/organisations/${duplicateId}/merge`,
    { target_id: targetId }
  )
  return response.data
}

export async function dismissOrganisationReview(id: number): Promise<Organisation> {
  const response = await apiClient.patch(`/organisations/${id}/dismiss_review`)
  return response.data
}

export async function fetchSimilarOrganisations(
  id: number
): Promise<Organisation[]> {
  const response = await apiClient.get(`/organisations/${id}/similar`)
  return response.data
}
