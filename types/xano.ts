export interface XanoConfig {
  apiBaseUrl: string
  usersApiRoute: string
  authCookieName: string
  authCookieMaxAge: number
  logoutRedirectUrl: string
}

export interface XanoUserPayload {
  clerk_user_id: string
  first_name: string
  last_name: string
  username: string
  created_at: number | null
  updated_at: number | null
  email: string
  authtoken_max_age: number
}
