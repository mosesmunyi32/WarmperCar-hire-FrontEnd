"use client"

import { Fragment, useEffect } from "react"
import type { ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Car,
  CalendarDays,
  Users,
  BarChart2,
  Crown,
  UserCog,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import useAuthStore from "@/store/authStore"
import { Separator } from "@/components/ui/separator"
import { UserMenu } from "@/components/user-menu"
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButtonLink,
  SidebarMenuLabel,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// ─── Nav config ──────────────────────────────────────────────────────────────
const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Cars", href: "/admin/cars", icon: Car },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarDays },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart2 },
]

// Super admin gets a single flat nav — no duplicate Dashboard/Analytics items
const SUPER_ADMIN_NAV = [
  { label: "SA Dashboard", href: "/super-admin/dashboard", icon: Crown },
  { label: "Cars", href: "/admin/cars", icon: Car },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarDays },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Manage Admins", href: "/super-admin/admins", icon: UserCog },
  { label: "SA Analytics", href: "/super-admin/analytics", icon: BarChart2 },
]

// ─── Breadcrumb lookup ───────────────────────────────────────────────────────
type Crumb = { label: string; href?: string }

const EXACT: Record<string, Crumb[]> = {
  "/admin/dashboard": [{ label: "Dashboard" }],
  "/admin/cars": [{ label: "Cars" }],
  "/admin/cars/add": [{ label: "Cars", href: "/admin/cars" }, { label: "Add Car" }],
  "/admin/bookings": [{ label: "Bookings" }],
  "/admin/customers": [{ label: "Customers" }],
  "/admin/analytics": [{ label: "Analytics" }],
  "/super-admin/dashboard": [{ label: "Super Admin" }, { label: "Dashboard" }],
  "/super-admin/admins": [{ label: "Super Admin" }, { label: "Manage Admins" }],
  "/super-admin/analytics": [{ label: "Super Admin" }, { label: "Analytics" }],
}

function deriveAdminBreadcrumbs(pathname: string): Crumb[] {
  if (EXACT[pathname]) return EXACT[pathname]
  if (pathname.startsWith("/admin/cars/"))
    return [{ label: "Cars", href: "/admin/cars" }, { label: "Car Details" }]
  if (pathname.startsWith("/admin/bookings/"))
    return [{ label: "Bookings", href: "/admin/bookings" }, { label: "Booking Details" }]
  if (pathname.startsWith("/admin/customers/"))
    return [{ label: "Customers", href: "/admin/customers" }, { label: "Customer" }]
  return [{ label: "Admin" }]
}

// ─── Dark sidebar CSS var overrides ──────────────────────────────────────────
const DARK_VARS: React.CSSProperties = {
  "--sidebar": "#0A1628",
  "--sidebar-foreground": "#E2E8F0",
  "--sidebar-border": "rgba(255,255,255,0.08)",
  "--sidebar-accent": "#1E3A8A",
  "--sidebar-accent-foreground": "#ffffff",
} as React.CSSProperties

// ─── Sidebar panel (needs to be inside SidebarProvider) ──────────────────────
function AdminSidebarPanel() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { open } = useSidebar()
  const isSuperAdmin = user?.role === "SUPER_ADMIN"

  return (
    <Sidebar style={DARK_VARS}>
      {/* Logo */}
      <SidebarHeader>
        <div className={cn("flex items-center gap-2.5 px-1 py-1", !open && "justify-center")}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/20 text-gold">
            <Car className="h-4 w-4" />
          </div>
          <SidebarMenuLabel className="flex flex-col leading-none">
            <span className="font-bold text-sm text-white">WAMPART</span>
            <span className="text-[10px] text-white/40 tracking-widest">ADMIN PANEL</span>
          </SidebarMenuLabel>
        </div>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{isSuperAdmin ? "Super Admin" : "Management"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {(isSuperAdmin ? SUPER_ADMIN_NAV : ADMIN_NAV).map(({ label, href, icon: Icon }) => {
                const active =
                  pathname === href ||
                  (href !== "/admin/dashboard" && href !== "/super-admin/dashboard" && pathname.startsWith(href))
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButtonLink href={href} isActive={active}>
                      <Icon className="h-4 w-4 shrink-0" />
                      <SidebarMenuLabel>{label}</SidebarMenuLabel>
                      {active && open && (
                        <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-50" />
                      )}
                    </SidebarMenuButtonLink>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User menu */}
      <SidebarFooter>
        <UserMenu collapsed={!open} dark />
      </SidebarFooter>
    </Sidebar>
  )
}

// ─── Shell export ─────────────────────────────────────────────────────────────
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const breadcrumbs = deriveAdminBreadcrumbs(pathname)

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login")
    } else if (user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      router.replace("/dashboard")
    }
  }, [isAuthenticated, user, router])

  const today = new Date().toLocaleDateString("en-KE", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  return (
    <SidebarProvider>
      <AdminSidebarPanel />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-light-gray bg-white px-4">
          <SidebarTrigger className="-ml-1 text-navy" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, i) => (
                <Fragment key={crumb.label}>
                  {i > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {i === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.href ?? "#"}>{crumb.label}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto text-xs text-muted-foreground hidden sm:block">{today}</div>
        </header>
        <div className="flex-1 bg-off-white overflow-auto">
          <div className="p-6">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
