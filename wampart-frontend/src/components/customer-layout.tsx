"use client"

import { Fragment } from "react"
import type { ReactNode } from "react"
import { Separator } from "@/components/ui/separator"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { CustomerSidebar } from "@/components/customer-sidebar"

interface BreadcrumbEntry {
  label: string
  href?: string
}

export function CustomerLayout({
  children,
  breadcrumbs,
}: {
  children: ReactNode
  breadcrumbs: BreadcrumbEntry[]
}) {
  const today = new Date().toLocaleDateString("en-KE", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  return (
    <SidebarProvider>
      <CustomerSidebar />
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
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
