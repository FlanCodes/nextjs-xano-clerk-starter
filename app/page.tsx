"use client"

import { useUser, UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function HomePage() {
  const { isLoaded, isSignedIn, user } = useUser()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="flex flex-col items-center">
          <CardTitle className="text-3xl font-bold">Welcome to Your App!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg text-muted-foreground">
            This is a public landing page. Sign in or sign up to access the full application.
          </p>

          {isLoaded && isSignedIn ? (
            <>
              <p className="text-green-600 dark:text-green-400">
                You are currently signed in as {user?.firstName || user?.username || "User"}.
              </p>
              <UserButton afterSignOutUrl="/api/logout" />
              <Button className="w-full mt-4" asChild>
                <Link href="/app">Go to Protected App</Link>
              </Button>
            </>
          ) : (
            <div className="flex flex-col gap-4">
              <Link href="/sign-in">
                <Button className="w-full">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button variant="outline" className="w-full bg-transparent">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
