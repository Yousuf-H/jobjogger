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
