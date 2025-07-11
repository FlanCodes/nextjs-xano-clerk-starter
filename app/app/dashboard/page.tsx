import { Button } from "@/components/ui/button"
import { AuthGuard, AppSidebar } from "@/components/layouts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserButton } from "@clerk/nextjs"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="flex min-h-screen w-full">
        <AppSidebar />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <h1 className="text-lg font-semibold md:text-xl">Dashboard</h1>
            <div className="ml-auto">
              <UserButton  />
            </div>
          </header>

          {/* Content */}
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>This is your protected dashboard.</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">2,350</div>
                      <p className="text-xs text-muted-foreground">+15% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">450</div>
                      <p className="text-xs text-muted-foreground">+5% from last week</p>
                    </CardContent>
                  </Card>
                </div>
                <Link href="/app" className="block">
                  <Button className="w-full">Go to App Home</Button>
                </Link>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
