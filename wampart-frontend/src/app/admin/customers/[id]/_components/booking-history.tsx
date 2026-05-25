"use client"

import { useState } from "react"
import Link from "next/link"
import { CalendarDays } from "lucide-react"
import { StatusBadge } from "@/components/status-badge"
import { AdminBooking, BookingHistoryResponse } from "@/types"
import { fmt } from "./types"

export function BookingHistory({
  bookings,
  history = [],
}: {
  bookings: AdminBooking[]
  history?: BookingHistoryResponse[]
}) {
  const [tab, setTab] = useState<"active" | "history">("active")

  return (
    <div className="bg-white rounded-xl border border-light-gray p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-navy text-sm flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-royal" /> Bookings
        </h2>
        <div className="flex gap-1 bg-off-white border border-light-gray rounded-lg p-0.5">
          <button
            onClick={() => setTab("active")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              tab === "active" ? "bg-navy text-white" : "text-muted-foreground hover:text-navy"
            }`}
          >
            Active <span className="ml-0.5 opacity-70">({bookings.length})</span>
          </button>
          <button
            onClick={() => setTab("history")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              tab === "history" ? "bg-navy text-white" : "text-muted-foreground hover:text-navy"
            }`}
          >
            History <span className="ml-0.5 opacity-70">({history.length})</span>
          </button>
        </div>
      </div>

      {tab === "active" && (
        bookings.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No active bookings.</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {bookings.map((b) => (
              <Link key={b.id} href={`/admin/bookings/${b.id}`}>
                <div className="flex items-center gap-3 p-3 bg-off-white rounded-lg border border-light-gray hover:border-royal transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-navy text-sm">
                      {b.carBrand && b.carModel ? `${b.carBrand} ${b.carModel}` : b.carId}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">{b.bookingReference}</p>
                    <p className="text-xs text-muted-foreground">
                      {fmt(b.startDate)} → {fmt(b.endDate)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <StatusBadge status={b.bookingStatus} />
                    <p className="text-sm font-semibold text-navy mt-1">
                      KES {(b.bookingCost ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}

      {tab === "history" && (
        history.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No booking history yet.</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {history.map((b) => (
              <div key={b.bookingReference} className="flex items-start gap-3 p-3 bg-off-white rounded-lg border border-light-gray">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-navy text-sm">
                    {b.carBrand && b.carModel
                      ? `${b.carBrand} ${b.carModel}${b.carYear ? ` (${b.carYear})` : ""}`
                      : "Vehicle"}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">{b.bookingReference}</p>
                  {b.numberPlate && (
                    <p className="text-xs text-muted-foreground font-mono">{b.numberPlate}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {fmt(b.startDate)} → {fmt(b.endDate)} · {b.numberOfDays} day{b.numberOfDays !== 1 ? "s" : ""}
                  </p>
                  {b.carWasDamaged && (
                    <p className="text-xs text-danger mt-0.5">Damage reported{b.inspectionComment ? ` — ${b.inspectionComment}` : ""}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <StatusBadge status={b.bookingStatus} />
                  <p className="text-sm font-semibold text-navy mt-1">
                    KES {(b.bookingCost ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
