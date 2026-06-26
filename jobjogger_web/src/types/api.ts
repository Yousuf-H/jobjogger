export interface ApiErrorResponse {
  status?: { message?: string }
  errors?: string[]
  error?: string
}
