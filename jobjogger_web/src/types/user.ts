export interface User {
  id: number
  email: string
  name: string
  avatar_url?: string | null
  demo: boolean
  terms_agreed_at: string | null
  created_at: string
  google_linked: boolean
  has_password: boolean
}
