import type { Contact, ContactInteraction } from '@/types/contact'
import { apiClient } from './client'

export async function fetchContacts(params?: {
  search?: string
  organisation_id?: number
}): Promise<Contact[]> {
  const response = await apiClient.get('/contacts', { params })
  return response.data
}

export async function fetchContact(id: number): Promise<Contact> {
  const response = await apiClient.get(`/contacts/${id}`)
  return response.data
}

export async function createContact(data: Partial<Contact>): Promise<Contact> {
  const response = await apiClient.post('/contacts', { contact: data })
  return response.data
}

export async function updateContact(
  id: number,
  data: Partial<Contact>
): Promise<Contact> {
  const response = await apiClient.patch(`/contacts/${id}`, { contact: data })
  return response.data
}

export async function deleteContact(id: number): Promise<void> {
  await apiClient.delete(`/contacts/${id}`)
}

export async function fetchJobContacts(jobId: number): Promise<Contact[]> {
  const response = await apiClient.get(`/jobs/${jobId}/job_contacts`)
  return response.data
}

export async function linkContactToJob(
  jobId: number,
  contactId: number
): Promise<void> {
  await apiClient.post(`/jobs/${jobId}/job_contacts`, { contact_id: contactId })
}

export async function unlinkContactFromJob(
  jobId: number,
  contactId: number
): Promise<void> {
  await apiClient.delete(`/jobs/${jobId}/job_contacts/${contactId}`)
}

export async function createInteraction(
  contactId: number,
  data: Pick<ContactInteraction, 'interaction_type' | 'notes' | 'occurred_at'>
): Promise<ContactInteraction> {
  const response = await apiClient.post(
    `/contacts/${contactId}/contact_interactions`,
    { contact_interaction: data }
  )
  return response.data
}

export async function deleteInteraction(
  contactId: number,
  interactionId: number
): Promise<void> {
  await apiClient.delete(
    `/contacts/${contactId}/contact_interactions/${interactionId}`
  )
}
