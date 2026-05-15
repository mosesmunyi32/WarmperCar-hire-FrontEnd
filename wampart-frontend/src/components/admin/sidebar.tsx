"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Car,
  CalendarDays,
  Users,
  BarChart2,
  Settings,
  Crown,
  UserCog,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import useAuthStore from "@/store/authStore"
import { useRouter } from "next/navigation"

const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Cars", href: "/admin/cars", icon: Car },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarDays },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart2 },
  { label: "Settings", href: "#", icon: Settings },
]

const SUPER_NAV = [
  { label: "SA Dashboard", href: "/super-admin/dashboard", icon: Crown },
  { label: "Manage Admins", href: "/super-admin/admins", icon: UserCog },
  { label: "SA Analytics", href: "/super-admin/analytics", icon: BarChart2 },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const isSuperAdmin = user?.role === "SUPER_ADMIN"

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-navy flex flex-col z-40">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-white/10">
        <Car className="h-7 w-7 text-gold" />
        <div>
          <p className="text-white font-bold text-base leading-tight">WAMPART</p>
          <p className="text-white/40 text-xs">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
        {ADMIN_NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href) && href !== "#"
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                active
                  ? "bg-royal text-white font-medium"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              {label}
            </Link>
          )
        })}

        {isSuperAdmin && (
          <>
            <div className="mt-4 mb-2 px-3">
              <span className="text-white/30 text-xs uppercase tracking-wider font-medium">Super Admin</span>
            </div>
            {SUPER_NAV.map(({ label, href, icon: Icon }) => {
              const active = pathname.startsWith(href)
              return (
                <Link
                  key={label}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    active
                      ? "bg-royal text-white font-medium"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  {label}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-royal flex items-center justify-center text-white text-xs font-semibold border border-white/20">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-white/40 text-xs truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-white/60 hover:text-danger hover:bg-danger/5 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
