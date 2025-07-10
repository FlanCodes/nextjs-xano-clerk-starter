import { auth } from "@clerk/nextjs/server"
import { getXanoAuthCookie } from "@/lib/xano/auth"
import { NextResponse } from "next/server"

/**
 * API Route to securely retrieve the HTTP-only Xano authentication token.
 * This is called from the client-side to check the token status.
 * Requires authentication via Clerk.
 */
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" }, 
        { status: 401 }
      )
    }

    const token = await getXanoAuthCookie()
    return NextResponse.json({ token })
  } catch (error) {
    console.error("Error in get-xano-cookie route:", error)
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    )
  }
}
