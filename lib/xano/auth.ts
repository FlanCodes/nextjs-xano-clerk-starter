import { cookies } from "next/headers"

const XANO_AUTH_COOKIE_NAME = process.env.XANO_AUTH_COOKIE_NAME || "xano_auth_token"
const XANO_AUTH_COOKIE_MAX_AGE = parseInt(process.env.XANO_AUTH_COOKIE_MAX_AGE || "604800", 10) // Default to 1 week if not set

/**
 * Sets the Xano authentication token as an HTTP-only cookie.
 * @param token The authentication token received from Xano.
 */
export async function setXanoAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(XANO_AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use secure in production
    sameSite: "lax",
    path: "/",
    maxAge: XANO_AUTH_COOKIE_MAX_AGE,
  })
}

/**
 * Deletes the Xano authentication token cookie.
 */
export async function deleteXanoAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(XANO_AUTH_COOKIE_NAME)
}

/**
 * Retrieves the Xano authentication token from the cookie.
 * This function is intended for server-side use.
 * @returns The Xano token string or undefined if not found.
 */
export async function getXanoAuthCookie() {
  const cookieStore = await cookies()
  return cookieStore.get(XANO_AUTH_COOKIE_NAME)?.value
}
