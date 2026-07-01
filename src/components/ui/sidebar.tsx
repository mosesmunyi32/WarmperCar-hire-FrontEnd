"use client"

import * as React from "react"
import { Dialog } from "radix-ui"
import { PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Constants ────────────────────────────────────────────────────────────────
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_ICON = "3.5rem"
const STORAGE_KEY = "sidebar-open"

// ─── Context ──────────────────────────────────────────────────────────────────
type SidebarContextValue = {
  open: boolean
  setOpen: (v: boolean) => void
  openMobile: boolean
  setOpenMobile: (v: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

function useSidebar() {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) throw new Error("useSidebar must be used within <SidebarProvider>")
  return ctx
}

// ─── Provider ─────────────────────────────────────────────────────────────────
function SidebarProvider({
  children,
  defaultOpen = true,
  className,
  style,
  ...props
}: React.ComponentProps<"div"> & { defaultOpen?: boolean }) {
  const [open, _setOpen] = React.useState(defaultOpen)
  const [openMobile, setOpenMobile] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)

  // Persist desktop open state
  const setOpen = React.useCallback((v: boolean) => {
    _setOpen(v)
    try { localStorage.setItem(STORAGE_KEY, String(v)) } catch {}
  }, [])

  // Restore on mount + watch viewport
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored !== null) _setOpen(stored === "true")
    } catch {}
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // ⌘B / Ctrl+B keyboard shortcut
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault()
        isMobile ? setOpenMobile((v) => !v) : setOpen(!open)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [isMobile, open, setOpen])

  const toggleSidebar = React.useCallback(() => {
    isMobile ? setOpenMobile((v) => !v) : setOpen(!open)
  }, [isMobile, open, setOpen])

  return (
    <SidebarContext.Provider value={{ open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar }}>
      <div
        data-slot="sidebar-wrapper"
        style={{
          "--sidebar-width": SIDEBAR_WIDTH,
          "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
          ...style,
        } as React.CSSProperties}
        className={cn(
          "group/sidebar-wrapper flex h-svh w-full overflow-hidden has-data-[variant=inset]:bg-sidebar",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({
  side = "left",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { side?: "left" | "right" }) {
  const { open, openMobile, setOpenMobile, isMobile } = useSidebar()

  // Mobile: Sheet/Dialog overlay
  if (isMobile) {
    return (
      <Dialog.Root open={openMobile} onOpenChange={setOpenMobile}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content
            data-slot="sidebar"
            data-mobile="true"
            className={cn(
              "fixed inset-y-0 z-50 flex h-full w-[var(--sidebar-width)] flex-col bg-sidebar p-0 shadow-xl",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=open]:duration-300",
              side === "left"
                ? "left-0 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left"
                : "right-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
              className
            )}
            {...props}
          >
            <Dialog.Title className="sr-only">Navigation</Dialog.Title>
            {children}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    )
  }

  // Desktop: collapsible panel
  return (
    <div
      data-slot="sidebar"
      data-state={open ? "expanded" : "collapsed"}
      className={cn(
        "group/sidebar relative flex h-svh flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-linear",
        "border-r border-sidebar-border",
        open ? "w-[var(--sidebar-width)]" : "w-[var(--sidebar-width-icon)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// ─── SidebarTrigger ───────────────────────────────────────────────────────────
function SidebarTrigger({ className, onClick, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar()
  return (
    <button
      data-slot="sidebar-trigger"
      type="button"
      onClick={(e) => { onClick?.(e); toggleSidebar() }}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle sidebar</span>
    </button>
  )
}

// ─── SidebarInset ─────────────────────────────────────────────────────────────
function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn("flex flex-1 flex-col min-w-0 overflow-auto bg-background", className)}
      {...props}
    />
  )
}

// ─── Structure ────────────────────────────────────────────────────────────────
function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn("flex flex-col gap-2 p-3 border-b border-sidebar-border", className)}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn("flex flex-col gap-2 p-3 border-t border-sidebar-border mt-auto", className)}
      {...props}
    />
  )
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn("flex flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden py-2", className)}
      {...props}
    />
  )
}

function SidebarSeparator({ className, ...props }: React.ComponentProps<"hr">) {
  return (
    <hr
      data-slot="sidebar-separator"
      className={cn("mx-3 border-t border-sidebar-border", className)}
      {...props}
    />
  )
}

// ─── Groups ───────────────────────────────────────────────────────────────────
function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      className={cn("relative flex flex-col gap-1 px-2", className)}
      {...props}
    />
  )
}

function SidebarGroupLabel({ className, ...props }: React.ComponentProps<"div">) {
  const { open } = useSidebar()
  return (
    <div
      data-slot="sidebar-group-label"
      className={cn(
        "px-2 py-1.5 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider transition-opacity duration-200",
        !open && "opacity-0 h-0 overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      className={cn("flex flex-col gap-0.5", className)}
      {...props}
    />
  )
}

// ─── Menu ─────────────────────────────────────────────────────────────────────
function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      className={cn("flex flex-col gap-0.5 list-none m-0 p-0", className)}
      {...props}
    />
  )
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  )
}

function SidebarMenuButton({
  isActive,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & { isActive?: boolean }) {
  const { open } = useSidebar()
  return (
    <button
      data-slot="sidebar-menu-button"
      data-active={isActive}
      type="button"
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left",
        "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
        !open && "justify-center px-2",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function SidebarMenuButtonLink({
  isActive,
  className,
  children,
  ...props
}: React.ComponentProps<"a"> & { isActive?: boolean }) {
  const { open } = useSidebar()
  return (
    <a
      data-slot="sidebar-menu-button"
      data-active={isActive}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
        !open && "justify-center px-2",
        className
      )}
      {...props}
    >
      {children}
    </a>
  )
}

function SidebarMenuLabel({ className, ...props }: React.ComponentProps<"span">) {
  const { open } = useSidebar()
  return (
    <span
      data-slot="sidebar-menu-label"
      className={cn(
        "truncate transition-[width,opacity] duration-200",
        !open && "w-0 opacity-0 overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

export {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarInset,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuButtonLink,
  SidebarMenuLabel,
  useSidebar,
}
