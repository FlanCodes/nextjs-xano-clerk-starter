"use server"

import { setXanoAuthCookie, deleteXanoAuthCookie } from "./auth"
import { transformClerkToXanoPayload, extractAuthToken, getXanoConfig } from "./utils"
import { redirect } from "next/navigation"
import type { ClerkUserPayload, XanoSyncResponse } from "@/types"

/**
 * Retry a function with exponential backoff
 */
const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        throw lastError
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
      console.warn(`Attempt ${attempt + 1} failed, retrying in ${Math.round(delay)}ms:`, error)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

/**
 * Enhanced fetch with proper error logging
 */
const fetchWithLogging = async (url: string, options: RequestInit) => {
  const response = await fetch(url, options)

  if (!response.ok) {
    let errorData: Record<string, unknown>
    let errorText = ""

    try {
      // Try to parse as JSON first
      errorText = await response.text()
      errorData = JSON.parse(errorText)
    } catch {
      // If JSON parsing fails, use the raw text
      errorData = { message: errorText || response.statusText }
    }

    // Log the full error details for debugging
    console.error("Xano API Error:", {
      status: response.status,
      statusText: response.statusText,
      url,
      errorData,
      headers: Object.fromEntries(response.headers.entries())
    })

    throw new Error(
      `Failed to sync user with Xano: ${response.status} - ${
        errorData.message || errorData.error || response.statusText
      }`
    )
  }

  return response
}

/**
 * Syncs the Clerk user data with Xano and stores the Xano auth token.
 * Includes retry logic for resilience against temporary failures.
 */
export async function syncUserWithXano(userData: ClerkUserPayload): Promise<XanoSyncResponse> {
  const config = getXanoConfig()

  if (!config.apiBaseUrl) {
    throw new Error("XANO_API_BASE_URL environment variable is not defined.")
  }
  if (!config.usersApiRoute) {
    throw new Error("XANO_USERS_API_ROUTE environment variable is not defined.")
  }

  const payload = transformClerkToXanoPayload(userData, config)

  try {
    const result = await withRetry(async () => {
      const response = await fetchWithLogging(`${config.apiBaseUrl}/${config.usersApiRoute}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.XANO_API_KEY}` 
        },
        body: JSON.stringify(payload),
      })

      const responseText = await response.text()
      const xanoAuthToken = extractAuthToken(responseText)

      if (!xanoAuthToken || xanoAuthToken.length === 0) {
        throw new Error("Xano did not return a valid auth token.")
      }

      return xanoAuthToken
    })

    await setXanoAuthCookie(result)
    return { success: true, message: "User synced with Xano successfully." }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("Xano sync failed after retries:", {
      error: errorMessage,
      userData: { id: userData.id, email: userData.emailAddress },
      timestamp: new Date().toISOString()
    })
    
    // Instead of throwing, return a failure response to allow graceful degradation
    return { 
      success: false, 
      message: `Xano sync failed: ${errorMessage}.` 
    }
  }
}

/**
 * Clears the Xano authentication token cookie and redirects to the sign-in page.
 * This function is a Server Action.
 */
export async function logoutAndClearXanoToken() {
  const config = getXanoConfig()
  await deleteXanoAuthCookie()
  redirect(config.logoutRedirectUrl)
}
