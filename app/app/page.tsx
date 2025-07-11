"use client"

import { useUser } from "@clerk/nextjs"
import { UserButton } from "@clerk/nextjs"
import { syncUserWithXano } from "@/lib/xano"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { AuthGuard, AppSidebar } from "@/components/layouts"
import Link from "next/link"
import { HomeIcon, LayoutDashboardIcon, SettingsIcon } from "lucide-react"

export default function AppPage() {
  const { isLoaded, isSignedIn, user } = useUser()

  const [xanoToken, setXanoToken] = useState<string | undefined>(undefined)
  const [syncStatus, setSyncStatus] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  // Helper to call the API route to get the Xano cookie
  const getXanoAuthCookieFromApi = async () => {
    try {
      const response = await fetch("/api/get-xano-cookie")
      if (response.ok) {
        const data = await response.json()
        return data.token
      }
    } catch (error) {
      throw new Error(`Error fetching Xano cookie from API: ${error instanceof Error ? error.message : String(error)}`)
    }
    return undefined
  }

  // Effect to handle Clerk authentication status and Xano sync
  useEffect(() => {
    const handleAuthAndSync = async () => {
      if (!isLoaded || !isSignedIn || !user) {
        // Wait for Clerk to load and user to be signed in
        return
      }

      // User is signed in, proceed with Xano token check and sync
      const currentXanoToken = await getXanoAuthCookieFromApi()
      setXanoToken(currentXanoToken) // Update internal state

      if (!currentXanoToken) {
        // Clerk user is authenticated, but Xano token is missing, attempt to sync
        setIsSyncing(true)
        setSyncStatus("Attempting to sync user data with Xano...")

        const userData = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          createdAt: user.createdAt?.getTime() || null,
          updatedAt: user.updatedAt?.getTime() || null,
          emailAddress: user.emailAddresses[0]?.emailAddress || "",
        }

        const result = await syncUserWithXano(userData)
        if (result.success) {
          setSyncStatus("User data synced with Xano successfully!")
          // Re-fetch token after successful sync to update internal state
          const newToken = await getXanoAuthCookieFromApi()
          setXanoToken(newToken)
        } else {
          setSyncStatus(`Xano sync failed: ${result.message}`)
        }
        setIsSyncing(false)
      } else {
        setSyncStatus("User data is synced with Xano.")
      }
    }

    handleAuthAndSync()
  }, [isLoaded, isSignedIn, user])

  return (
    <AuthGuard>
      <div className="flex min-h-screen w-full">
        <AppSidebar />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <h1 className="text-lg font-semibold md:text-xl">App Home</h1>
            <div className="ml-auto">
              <UserButton  />
            </div>
          </header>

          {/* Content */}
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Welcome</CardTitle>
                  <HomeIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">Hello, {user?.firstName || user?.username || "User"}!</p>
                  <p className="text-xs text-muted-foreground">You are logged in.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Xano Sync Status</CardTitle>
                  <SettingsIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className={xanoToken ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                    {syncStatus}
                  </p>
                  {!xanoToken && (
                    <Button
                      onClick={async () => {
                        if (user) {
                          setIsSyncing(true)
                          setSyncStatus("Attempting to sync user data with Xano...")
                          const userData = {
                            id: user.id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            username: user.username,
                            createdAt: user.createdAt?.getTime() || null,
                            updatedAt: user.updatedAt?.getTime() || null,
                            emailAddress: user.emailAddresses[0]?.emailAddress || "",
                          }
                          const result = await syncUserWithXano(userData)
                          if (result.success) {
                            setSyncStatus("User data synced with Xano successfully!")
                            const newToken = await getXanoAuthCookieFromApi()
                            setXanoToken(newToken)
                          } else {
                            setSyncStatus(`Xano sync failed: ${result.message}`)
                          }
                          setIsSyncing(false)
                        }
                      }}
                      disabled={isSyncing}
                      className="mt-2 w-full"
                    >
                      {isSyncing ? "Syncing..." : "Retry Xano Sync"}
                    </Button>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                  <LayoutDashboardIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/app/dashboard" className="block">
                    <Button className="w-full">Go to Dashboard</Button>
                  </Link>
                  <Link href="/app/settings" className="block">
                    <Button variant="outline" className="w-full bg-transparent">
                      Go to Settings
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
            {/* Add more app content here */}
            <Card>
              <CardHeader>
                <CardTitle>Your Content Area</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This is where you can add more features and information for your authenticated users.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Feel free to add tables, forms, charts, or any other components here.
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
