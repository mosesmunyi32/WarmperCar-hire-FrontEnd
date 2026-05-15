"use client"

import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Car,
  CalendarDays,
  User,
  Shield,
  LogOut,
  ChevronRight,
} from "lucide-react"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuButtonLink,
  SidebarMenuLabel,
  useSidebar,
} from "@/components/ui/sidebar"
import useAuthStore from "@/store/authStore"
import { cn } from "@/lib/utils"

const NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Bookings", href: "/bookings", icon: CalendarDays },
  { label: "Browse Cars", href: "/cars", icon: Car },
]

export function CustomerSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { open } = useSidebar()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <Sidebar>
      {/* Logo */}
      <SidebarHeader>
        <div className={cn("flex items-center gap-2.5 px-1 py-1", !open && "justify-center")}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy text-gold">
            <Car className="h-4.5 w-4.5" />
          </div>
          <SidebarMenuLabel className="flex flex-col leading-none">
            <span className="font-bold text-sm text-navy">WAMPART</span>
            <span className="text-[10px] text-muted-foreground tracking-widest">CAR HIRE</span>
          </SidebarMenuLabel>
        </div>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map(({ label, href, icon: Icon }) => {
                const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButtonLink href={href} isActive={active}>
                      <Icon className="h-4.5 w-4.5 shrink-0" />
                      <SidebarMenuLabel>{label}</SidebarMenuLabel>
                      {active && open && (
                        <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-50" />
                      )}
                    </SidebarMenuButtonLink>
                  </SidebarMenuItem>
                )
              })}
              {/* Profile — built at click time so user.id is always hydrated */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname.startsWith("/profile")}
                  onClick={() => user?.id && router.push(`/profile/${user.id}`)}
                >
                  <User className="h-4.5 w-4.5 shrink-0" />
                  <SidebarMenuLabel>My Profile</SidebarMenuLabel>
                  {pathname.startsWith("/profile") && open && (
                    <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-50" />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButtonLink href="/security" isActive={pathname === "/security"}>
                  <Shield className="h-4.5 w-4.5 shrink-0" />
                  <SidebarMenuLabel>Security</SidebarMenuLabel>
                  {pathname === "/security" && open && (
                    <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-50" />
                  )}
                </SidebarMenuButtonLink>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User + Logout */}
      <SidebarFooter>
        <div className={cn("flex items-center gap-3 px-1 py-1 min-w-0", !open && "justify-center")}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-royal text-white text-xs font-semibold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <SidebarMenuLabel className="flex flex-col leading-none min-w-0">
            <span className="text-sm font-medium text-navy truncate">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
          </SidebarMenuLabel>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            "text-muted-foreground hover:bg-danger/10 hover:text-danger",
            !open && "justify-center px-2"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <SidebarMenuLabel>Sign Out</SidebarMenuLabel>
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
