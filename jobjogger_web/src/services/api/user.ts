import { apiClient } from './client'

export async function updateProfile(data: {
  name: string
  email: string
  current_password?: string
  phone?: string | null
  location?: string | null
  linkedin_url?: string | null
  job_title?: string | null
}) {
  const response = await apiClient.patch('/users', { user: data })
  return response.data
}

export async function updateNotificationPrefs(data: {
  notify_follow_up_reminders: boolean
  notify_interview_reminders: boolean
}) {
  const response = await apiClient.patch('/users/notifications', { user: data })
  return response.data
}

export async function updatePassword(data: {
  current_password: string
  password: string
  password_confirmation: string
}) {
  const response = await apiClient.patch('/users/password', { user: data })
  return response.data
}

export async function setInitialPassword(data: {
  password: string
  password_confirmation: string
}) {
  const response = await apiClient.patch('/users/password/set', { user: data })
  return response.data
}

export async function deleteAccount(password: string) {
  const response = await apiClient.delete('/users', {
    data: { user: { password } },
  })
  return response.data
}

export async function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('avatar', file)

  const response = await apiClient.patch('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function deleteAvatar() {
  const response = await apiClient.delete('/users/avatar')
  return response.data
}

export async function fetchMe() {
  const response = await apiClient.get('/users/me')
  return response.data.user
}

export async function acceptTermsApi() {
  const response = await apiClient.patch('/users/me/accept_terms')
  return response.data
}

export async function demoSigninApi() {
  const response = await apiClient.post('/demo/session')
  return response
}

export async function unlinkGoogle() {
  const response = await apiClient.delete('/users/google')
  return response.data
}
