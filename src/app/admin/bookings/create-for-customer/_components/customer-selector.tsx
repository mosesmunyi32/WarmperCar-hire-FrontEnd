"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { UserResponse } from "@/types"
import { cn } from "@/lib/utils"
import { GI } from "./types"

export function CustomerSelector({
  customers,
  value,
  onChange,
}: {
  customers: UserResponse[]
  value: UserResponse | null
  onChange: (customer: UserResponse | null) => void
}) {
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleOutside)
    return () => document.removeEventListener("mousedown", handleOutside)
  }, [])

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase()
    return `${c.firstName} ${c.lastName} ${c.email} ${c.idNumber ?? ""}`.toLowerCase().includes(q)
  })

  if (value) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-4 rounded-xl border border-azure/30 bg-azure/5 px-4 py-3">
          <div className="h-10 w-10 rounded-full bg-royal flex items-center justify-center text-white text-sm font-bold shrink-0">
            {value.firstName?.[0]}{value.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-navy text-sm">
              {value.firstName} {value.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{value.email}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                value.isVerified ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
              )}
            >
              {value.isVerified ? "Verified" : "Unverified"}
            </span>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-muted-foreground hover:text-danger transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!value.idNumber && (
          <div className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/[0.07] px-4 py-3">
            <span className="text-warning text-base leading-none mt-0.5">⚠</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-warning">No ID number on file</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                This customer&apos;s profile is missing a National ID number, which is required to create a
                booking.{" "}
                <Link
                  href={`/admin/customers/${value.id}`}
                  target="_blank"
                  className="text-azure font-medium hover:underline"
                >
                  Open profile to update →
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative" ref={ref}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        placeholder="Search by name, email or ID number…"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        className={cn(GI, "pl-9")}
      />
      {open && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-light-gray rounded-xl shadow-lg max-h-56 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground text-center">
              {customers.length === 0 ? "Loading customers…" : "No customers match your search."}
            </div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); onChange(c); setSearch(""); setOpen(false) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-off-white transition-colors text-left border-b border-light-gray last:border-0"
              >
                <div className="h-8 w-8 rounded-full bg-royal/10 border border-royal/20 flex items-center justify-center text-xs font-bold text-royal shrink-0">
                  {c.firstName?.[0]}{c.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-navy text-sm">
                    {c.firstName} {c.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{c.email}</p>
                </div>
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full shrink-0",
                    c.isVerified ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                  )}
                >
                  {c.isVerified ? "Verified" : "Unverified"}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
