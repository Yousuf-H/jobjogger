import { apiClient } from './client'

export async function updateProfile(data: { name: string; email: string }) {
  const response = await apiClient.patch('/users', { user: data })
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

export async function demoSigninApi() {
  const response = await apiClient.post('/demo/session')
  return response
}
