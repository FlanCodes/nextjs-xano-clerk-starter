import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const XANO_AUTH_COOKIE_NAME = process.env.XANO_AUTH_COOKIE_NAME || "xano_auth_token"

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

// Define routes that don't require Xano sync
const isXanoSyncExemptRoute = createRouteMatcher([
  '/api/sync-xano',
  '/api/logout',
  '/logout',
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  
  // Check if this might be a logout redirect scenario
  const isLikelyLogoutRedirect = !userId && 
    req.cookies.get(XANO_AUTH_COOKIE_NAME) && 
    isPublicRoute(req) &&
    req.headers.get('referer')?.includes('/app')
  
  // If user is not authenticated but has a Xano token
  if (!userId && req.cookies.get(XANO_AUTH_COOKIE_NAME)) {
    // For logout redirects to public pages, clear cookie but don't interfere with redirect
    if (isLikelyLogoutRedirect) {
      const response = NextResponse.next()
      response.cookies.delete(XANO_AUTH_COOKIE_NAME)
      return response
    }
    
    // For protected routes, redirect to sign-in and clear cookie
    if (!isPublicRoute(req)) {
      const response = NextResponse.redirect(new URL('/sign-in', req.url))
      response.cookies.delete(XANO_AUTH_COOKIE_NAME)
      return response
    }
    
    // For other public routes, just clear the cookie
    const response = NextResponse.next()
    response.cookies.delete(XANO_AUTH_COOKIE_NAME)
    return response
  }
  
  // Protect all routes except public ones
  if (!isPublicRoute(req)) {
    await auth.protect()
    
    // For protected routes, also check for Xano auth cookie
    if (!isXanoSyncExemptRoute(req)) {
      const xanoToken = req.cookies.get(XANO_AUTH_COOKIE_NAME)?.value
      
      if (!xanoToken) {
        // User is authenticated with Clerk but doesn't have Xano token
        // Redirect to sync API endpoint which will handle background sync
        const syncUrl = new URL('/api/sync-xano', req.url)
        syncUrl.searchParams.set('redirect', req.url)
        return NextResponse.redirect(syncUrl)
      }
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
