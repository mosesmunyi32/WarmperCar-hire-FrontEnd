"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, CalendarDays, XCircle, AlertCircle, Download } from "lucide-react"
import { CustomerLayout } from "@/components/customer-layout"
import { StatusBadge } from "@/components/status-badge"
import { bookingService } from "@/services/bookingServices"
import { BookingHistoryResponse } from "@/types"
import { format } from "date-fns"

function fmt(iso: string) {
  try { return format(new Date(iso), "MMM d, yyyy") } catch { return iso }
}

function RowSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-light-gray p-5 animate-pulse flex gap-4">
      <div className="h-10 w-10 bg-light-gray rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-40 bg-light-gray rounded" />
        <div className="h-3 w-56 bg-light-gray rounded" />
        <div className="h-3 w-32 bg-light-gray rounded" />
      </div>
      <div className="space-y-2 text-right">
        <div className="h-5 w-20 bg-light-gray rounded-full" />
        <div className="h-4 w-24 bg-light-gray rounded" />
      </div>
    </div>
  )
}

export default function BookingHistoryPage() {
  const [history, setHistory] = useState<BookingHistoryResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      bookingService.getMyBookingHistory(),
      bookingService.getMyBookings().catch(() => []),
    ])
      .then(([hist, bookings]) => {
        // Enrich history with receiptUrl from the full bookings list
        const receiptMap: Record<string, string | null> = {}
        bookings.forEach((b) => {
          if (b.receiptUrl) receiptMap[b.bookingReference] = b.receiptUrl
        })
        setHistory(
          hist.map((h) => ({
            ...h,
            receiptUrl: receiptMap[h.bookingReference] ?? h.receiptUrl ?? null,
          }))
        )
      })
      .catch(() => setError("Failed to load booking history. Please refresh."))
      .finally(() => setLoading(false))
  }, [])

  return (
    <CustomerLayout
      breadcrumbs={[
        { label: "My Bookings", href: "/bookings" },
        { label: "Trip History" },
      ]}
    >
      <div className="mx-auto max-w-3xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/bookings" className="flex items-center gap-1.5 text-muted-foreground hover:text-navy text-sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="h-4 w-px bg-light-gray" />
          <div>
            <h1 className="text-xl font-bold text-navy flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-royal" /> Trip History
            </h1>
            {!loading && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {history.length} trip{history.length !== 1 ? "s" : ""} recorded
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3 mb-4">
            <XCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        <div className="space-y-3">
          {loading ? (
            [0, 1, 2, 3].map((i) => <RowSkeleton key={i} />)
          ) : history.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No trip history yet</p>
              <p className="text-sm mt-1">Your completed and past bookings will appear here.</p>
              <Link href="/cars" className="mt-4 inline-block text-sm text-royal hover:underline">
                Browse cars to make your first booking →
              </Link>
            </div>
          ) : (
            history.map((b) => (
              <div
                key={b.bookingReference}
                className="bg-white rounded-xl border border-light-gray p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-navy/5 flex items-center justify-center shrink-0">
                      <CalendarDays className="h-5 w-5 text-navy/40" />
                    </div>
                    <div>
                      <p className="font-semibold text-navy">
                        {b.carBrand && b.carModel
                          ? `${b.carBrand} ${b.carModel}${b.carYear ? ` (${b.carYear})` : ""}`
                          : "Vehicle"}
                        {b.numberPlate && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground font-mono">
                            {b.numberPlate}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{b.bookingReference}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {fmt(b.startDate)} → {fmt(b.endDate)}
                        {" · "}{b.numberOfDays} day{b.numberOfDays !== 1 ? "s" : ""}
                      </p>
                      {b.carWasDamaged && (
                        <p className="text-xs text-danger mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Damage reported
                          {b.inspectionComment ? ` — ${b.inspectionComment}` : ""}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                    <StatusBadge status={b.bookingStatus} />
                    <p className="text-base font-bold text-navy">
                      KES {(b.bookingCost ?? 0).toLocaleString()}
                    </p>
                    {b.receiptUrl && (
                      <a
                        href={b.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-royal hover:underline"
                      >
                        <Download className="h-3 w-3" /> Receipt
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </CustomerLayout>
  )
}
