import type { ClerkUserPayload, XanoConfig, XanoUserPayload } from '@/types'

/**
 * Transforms Clerk user data to Xano payload format
 * Pure utility function for data transformation
 */
export const transformClerkToXanoPayload = (userData: ClerkUserPayload, config: XanoConfig): XanoUserPayload => ({
  clerk_user_id: userData.id,
  first_name: userData.firstName || "",
  last_name: userData.lastName || "",
  username: userData.username || "",
  created_at: userData.createdAt,
  updated_at: userData.updatedAt,
  email: userData.emailAddress,
  authtoken_max_age: config.authCookieMaxAge,
})

/**
 * Extracts auth token from Xano response
 */
export const extractAuthToken = (responseText: string): string | undefined => {
  try {
    const data = JSON.parse(responseText)
    // If it's valid JSON and contains an 'authToken' property
    if (data && typeof data === "object" && "authToken" in data) {
      return data.authToken
    }
    // If it's valid JSON but doesn't have 'authToken', use the raw text
    return responseText
  } catch {
    // If JSON parsing fails, it means it's likely a raw token string
    return responseText
  }
}

/**
 * Configuration from environment variables
 */
export const getXanoConfig = (): XanoConfig => ({
  apiBaseUrl: process.env.XANO_API_BASE_URL || "",
  usersApiRoute: process.env.XANO_USERS_API_ROUTE || "",
  authCookieName: process.env.XANO_AUTH_COOKIE_NAME || "xano_auth_token",
  authCookieMaxAge: parseInt(process.env.XANO_AUTH_COOKIE_MAX_AGE || "604800", 10),
  logoutRedirectUrl: process.env.LOGOUT_REDIRECT_URL || "/",
})
