"use client"

import { useEffect, useRef, useState } from "react"
import { Car, ChevronDown, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AdminCar } from "@/types"
import { cn } from "@/lib/utils"
import { GL, GI } from "./types"

export function CarSelector({
  cars,
  value,
  onChange,
}: {
  cars: AdminCar[]
  value: AdminCar | null
  onChange: (car: AdminCar | null) => void
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

  const filtered = cars.filter((c) =>
    `${c.numberPlate} ${c.brand} ${c.model}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <label className={GL}>
        Car <span className="text-danger">*</span>
      </label>
      {value ? (
        <div className="flex items-center gap-3 h-10 rounded-lg border border-azure/40 bg-azure/5 px-3">
          <Car className="h-4 w-4 text-azure shrink-0" />
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <span className="font-mono font-semibold text-navy text-sm">{value.numberPlate}</span>
            <span className="text-sm text-muted-foreground">
              — {value.brand} {value.model}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-muted-foreground hover:text-danger transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative" ref={ref}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by plate, brand or model…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            className={cn(GI, "pl-9 pr-8")}
          />
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          {open && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-light-gray rounded-xl shadow-lg max-h-52 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                  {cars.length === 0 ? "Loading cars…" : "No cars match your search."}
                </div>
              ) : (
                filtered.map((car) => (
                  <button
                    key={car.id}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); onChange(car); setSearch(""); setOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-off-white transition-colors text-left border-b border-light-gray last:border-0"
                  >
                    <Car className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="font-mono font-semibold text-navy text-sm">{car.numberPlate}</span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        {car.brand} {car.model}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full shrink-0",
                        car.isAvailable
                          ? "bg-success/10 text-success"
                          : "bg-muted-foreground/10 text-muted-foreground"
                      )}
                    >
                      {car.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
