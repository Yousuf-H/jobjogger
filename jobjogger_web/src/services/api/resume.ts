import type { ResumeTemplate, ResumeTemplateWithVariants, ResumeVariant } from '@/types/resume'
import { apiClient } from './client'

// ── Templates ─────────────────────────────────────────────────────────────────

export async function fetchResumeTemplates(): Promise<ResumeTemplate[]> {
  const response = await apiClient.get('/resume_templates')
  return response.data
}

export async function fetchResumeTemplate(id: number): Promise<ResumeTemplateWithVariants> {
  const response = await apiClient.get(`/resume_templates/${id}`)
  return response.data
}

export async function createResumeTemplate(data: {
  name: string
  notes?: string
  pdf?: File
}): Promise<ResumeTemplate> {
  if (data.pdf) {
    const form = new FormData()
    form.append('resume_template[name]', data.name)
    if (data.notes) form.append('resume_template[notes]', data.notes)
    form.append('pdf', data.pdf)
    const response = await apiClient.post('/resume_templates', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  }
  const response = await apiClient.post('/resume_templates', {
    resume_template: { name: data.name, notes: data.notes },
  })
  return response.data
}

export async function updateResumeTemplate(
  id: number,
  data: { name?: string; notes?: string; pdf?: File }
): Promise<ResumeTemplate> {
  if (data.pdf) {
    const form = new FormData()
    if (data.name !== undefined) form.append('resume_template[name]', data.name)
    if (data.notes !== undefined) form.append('resume_template[notes]', data.notes)
    form.append('pdf', data.pdf)
    const response = await apiClient.patch(`/resume_templates/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  }
  const response = await apiClient.patch(`/resume_templates/${id}`, {
    resume_template: { name: data.name, notes: data.notes },
  })
  return response.data
}

export async function deleteResumeTemplate(id: number): Promise<void> {
  await apiClient.delete(`/resume_templates/${id}`)
}

// ── Variants ──────────────────────────────────────────────────────────────────

export async function fetchAllResumeVariants(): Promise<ResumeVariant[]> {
  const response = await apiClient.get('/resume_variants')
  return response.data
}

export async function fetchResumeVariants(templateId: number): Promise<ResumeVariant[]> {
  const response = await apiClient.get(`/resume_templates/${templateId}/resume_variants`)
  return response.data
}

export async function fetchResumeVariant(id: number): Promise<ResumeVariant> {
  const response = await apiClient.get(`/resume_variants/${id}`)
  return response.data
}

export async function createResumeVariant(
  templateId: number,
  data: { notes?: string; pdf?: File }
): Promise<ResumeVariant> {
  if (data.pdf) {
    const form = new FormData()
    if (data.notes) form.append('resume_variant[notes]', data.notes)
    form.append('pdf', data.pdf)
    const response = await apiClient.post(
      `/resume_templates/${templateId}/resume_variants`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return response.data
  }
  const response = await apiClient.post(
    `/resume_templates/${templateId}/resume_variants`,
    { resume_variant: { notes: data.notes } }
  )
  return response.data
}

export async function updateResumeVariant(
  id: number,
  data: { notes?: string; pdf?: File }
): Promise<ResumeVariant> {
  if (data.pdf) {
    const form = new FormData()
    if (data.notes !== undefined) form.append('resume_variant[notes]', data.notes)
    form.append('pdf', data.pdf)
    const response = await apiClient.patch(`/resume_variants/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  }
  const response = await apiClient.patch(`/resume_variants/${id}`, {
    resume_variant: { notes: data.notes },
  })
  return response.data
}

export async function deleteResumeVariant(id: number): Promise<void> {
  await apiClient.delete(`/resume_variants/${id}`)
}

export async function linkResumeVariant(
  jobId: number,
  variantId: number | null
): Promise<void> {
  await apiClient.patch(`/jobs/${jobId}`, { job: { resume_variant_id: variantId } })
}
