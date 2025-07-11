import { currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { syncUserWithXano } from '@/lib/xano/actions'

export async function GET(request: NextRequest) {
  try {
    // Get the current user from Clerk
    const user = await currentUser()
    
    if (!user) {
      // User not authenticated, redirect to sign-in
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    // Prepare user data for Xano sync
    const userData = {
      id: user.id,
      emailAddress: user.primaryEmailAddress?.emailAddress || "",
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      createdAt: user.createdAt ? Math.floor(user.createdAt / 1000) : null,
      updatedAt: user.updatedAt ? Math.floor(user.updatedAt / 1000) : null,
    }

    // Attempt to sync with Xano
    const result = await syncUserWithXano(userData)

    if (result.success) {
      // Sync successful, redirect to the originally requested URL or dashboard
      const redirectUrl = request.nextUrl.searchParams.get('redirect') || '/app/dashboard'
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    } else {
      // Sync failed, redirect to home page with error
      const homeUrl = new URL('/', request.url)
      homeUrl.searchParams.set('error', 'sync-failed')
      homeUrl.searchParams.set('message', encodeURIComponent(result.message || 'Failed to sync with backend'))
      return NextResponse.redirect(homeUrl)
    }
  } catch (error) {
    console.error('Background sync error:', error)
    
    // Unexpected error, redirect to home page with generic error
    const homeUrl = new URL('/', request.url)
    homeUrl.searchParams.set('error', 'sync-failed')
    homeUrl.searchParams.set('message', encodeURIComponent('An unexpected error occurred during backend sync'))
    return NextResponse.redirect(homeUrl)
  }
}
