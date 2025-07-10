import { auth } from "@clerk/nextjs/server"
import { logoutAndClearXanoToken } from "@/lib/xano/sync"
import { NextResponse } from "next/server"

/**
 * API Route to handle Clerk's afterSignOutUrl.
 * It clears the Xano authentication token cookie and then redirects.
 * Requires authentication via Clerk.
 */
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Already logged out" }, 
        { status: 401 }
      )
    }

    await logoutAndClearXanoToken()
    // The logoutAndClearXanoToken action already handles the redirect to /sign-in
    // This API route simply acts as a trigger point.
    return NextResponse.json({ message: "Logged out and Xano token cleared." })
  } catch (error) {
    console.error("Error in logout route:", error)
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    )
  }
}
