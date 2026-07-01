"use client"

import { useRouter } from "next/navigation"
import { User, Bell, LogOut, ChevronsUpDown, ShieldCheck } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import useAuthStore from "@/store/authStore"
import { cn } from "@/lib/utils"

interface UserMenuProps {
  collapsed?: boolean
  dark?: boolean
  notificationCount?: number
}

export function UserMenu({ collapsed = false, dark = false, notificationCount = 0 }: UserMenuProps) {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`
  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-2 py-2 transition-colors outline-none",
            dark
              ? "hover:bg-white/10 text-white"
              : "hover:bg-off-white text-navy",
            collapsed && "justify-center px-0"
          )}
        >
          {/* Avatar */}
          <div className={cn(
            "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold border",
            dark ? "bg-royal text-white border-white/20" : "bg-navy text-white border-navy/20"
          )}>
            {initials}
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-white text-[9px] font-bold border border-white">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </div>

          {!collapsed && (
            <>
              <div className="flex flex-col leading-none min-w-0 flex-1 text-left">
                <span className={cn("text-sm font-medium truncate", dark ? "text-white" : "text-navy")}>
                  {fullName}
                </span>
                <span className={cn("text-xs truncate", dark ? "text-white/50" : "text-muted-foreground")}>
                  {user?.email ?? user?.role}
                </span>
              </div>
              <ChevronsUpDown className={cn("h-4 w-4 shrink-0", dark ? "text-white/40" : "text-muted-foreground")} />
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="top"
        align="start"
        className="w-60"
        sideOffset={8}
      >
        {/* Identity header */}
        <div className="flex items-center gap-3 px-2.5 py-2.5 border-b border-light-gray mb-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-white text-xs font-bold">
            {initials}
          </div>
          <div className="flex flex-col leading-none min-w-0">
            <span className="text-sm font-semibold text-navy truncate">{fullName}</span>
            <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
            {user?.role && (
              <span className="text-[10px] font-medium text-royal mt-0.5">{user.role.replace(/_/g, " ")}</span>
            )}
          </div>
        </div>

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => user?.id && router.push(`/profile/${user.id}`)}>
            <User className="text-muted-foreground" />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/security")}>
            <ShieldCheck className="text-muted-foreground" />
            Security
          </DropdownMenuItem>
          <DropdownMenuItem className="relative" onClick={() => router.push("/notifications")}>
            <Bell className="text-muted-foreground" />
            Notifications
            {notificationCount > 0 && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white text-[10px] font-bold">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="text-danger focus:text-danger focus:bg-danger/5"
        >
          <LogOut className="text-danger" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
