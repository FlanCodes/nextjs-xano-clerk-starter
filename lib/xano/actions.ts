"use server"

import { syncUserWithXano as _syncUserWithXano, logoutAndClearXanoToken as _logoutAndClearXanoToken } from './sync'
import type { ClerkUserPayload, XanoSyncResponse } from '@/types'

// Server actions that can be called from client components
export async function syncUserWithXano(userData: ClerkUserPayload): Promise<XanoSyncResponse> {
  return await _syncUserWithXano(userData)
}

export async function logoutAndClearXanoToken(): Promise<void> {
  return await _logoutAndClearXanoToken()
}
