export interface ClerkUserPayload {
  id: string
  firstName: string | null
  lastName: string | null
  username: string | null
  createdAt: number | null // Unix timestamp
  updatedAt: number | null // Unix timestamp
  emailAddress: string
}

export interface XanoSyncResponse {
  success: boolean
  message: string
}

export interface XanoAuthResponse {
  authToken?: string
  [key: string]: any
}
