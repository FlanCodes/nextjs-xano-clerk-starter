import { deleteXanoAuthCookie } from "@/lib/xano/auth"
import { NextRequest, NextResponse } from "next/server"

/**
 * API Route to clear the Xano authentication token cookie.
 * Can be called before logout or as part of the logout process.
 */
export async function GET() {
  try {
    // Clear the Xano auth cookie
    await deleteXanoAuthCookie()
    
    console.log('Xano token cleared successfully')
    
    return NextResponse.json({ success: true, message: "Xano token cleared" })
  } catch (error) {
    console.error("Error clearing Xano token:", error)
    
    return NextResponse.json(
      { success: false, error: "Failed to clear Xano token" }, 
      { status: 500 }
    )
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest) {
  // Handle POST requests the same way as GET
  return GET()
}
