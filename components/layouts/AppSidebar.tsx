"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HomeIcon, LayoutDashboardIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function AppSidebar() {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/app",
      icon: HomeIcon,
      label: "Home",
    },
    {
      href: "/app/dashboard",
      icon: LayoutDashboardIcon,
      label: "Dashboard",
    },
  ]

  return (
    <aside className="hidden w-64 flex-col border-r bg-background p-4 md:flex">
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                isActive
                  ? "text-primary bg-muted"
                  : "text-muted-foreground"
              )}
              href={item.href}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
