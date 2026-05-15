"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Car, Calendar, MapPin, FileText, AlertTriangle, XCircle } from "lucide-react"
import { CustomerLayout } from "@/components/customer-layout"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { bookingService } from "@/services/bookingServices"
import { Booking } from "@/types"
import { format } from "date-fns"

function formatDate(iso: string) {
  try { return format(new Date(iso), "MMM d, yyyy") } catch { return iso }
}

function DetailSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-white rounded-xl border border-light-gray p-5 h-28" />
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-light-gray p-5 h-44" />
        <div className="bg-white rounded-xl border border-light-gray p-5 h-44" />
      </div>
    </div>
  )
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    bookingService
      .getBookingById(id)
      .then(setBooking)
      .catch(() => setError("Failed to load booking details."))
      .finally(() => setLoading(false))
  }, [id])

  const handleCancel = async () => {
    if (!booking) return
    setCancelling(true)
    try {
      const updated = await bookingService.cancelBooking(booking.id)
      setBooking(updated)
    } catch {
      setError("Failed to cancel booking. Please try again.")
    } finally {
      setCancelling(false)
    }
  }

  const canCancel = booking?.bookingStatus === "PENDING" || booking?.bookingStatus === "CONFIRMED"

  return (
    <CustomerLayout
      breadcrumbs={[
        { label: "My Bookings", href: "/bookings" },
        { label: booking?.bookingReference ?? "Booking Details" },
      ]}
    >
      <div className="mx-auto max-w-3xl w-full px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="flex items-center gap-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3 mb-4">
            <XCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <DetailSkeleton />
        ) : !booking ? (
          <div className="text-center py-16 text-muted-foreground">
            <Car className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Booking not found</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-white rounded-xl border border-light-gray p-5 mb-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-xl font-bold text-navy">
                      {booking.carBrand && booking.carModel
                        ? `${booking.carBrand} ${booking.carModel}`
                        : booking.bookingReference}
                    </h1>
                    <StatusBadge status={booking.bookingStatus} />
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">{booking.bookingReference}</p>
                  <p className="text-xs text-muted-foreground mt-1">Booked on {formatDate(booking.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-royal">KES {(booking.bookingCost ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {booking.numberOfDays} day{booking.numberOfDays !== 1 ? "s" : ""} × KES {booking.pricePerDay.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              {/* Trip details */}
              <div className="bg-white rounded-xl border border-light-gray p-5 shadow-sm">
                <h2 className="font-semibold text-navy text-sm mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-royal" /> Trip Details
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pick Up</span>
                    <span className="font-medium text-navy">{formatDate(booking.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Return</span>
                    <span className="font-medium text-navy">{formatDate(booking.endDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium text-navy">
                      {booking.numberOfDays} day{booking.numberOfDays !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> Destination
                    </span>
                    <span className="font-medium text-navy">{booking.travelDestination}</span>
                  </div>
                </div>
              </div>

              {/* Cost breakdown */}
              <div className="bg-white rounded-xl border border-light-gray p-5 shadow-sm">
                <h2 className="font-semibold text-navy text-sm mb-4 flex items-center gap-2">
                  <Car className="h-4 w-4 text-royal" /> Cost Breakdown
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rate</span>
                    <span className="font-medium text-navy">KES {booking.pricePerDay.toLocaleString()} /day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium text-navy">{booking.numberOfDays} days</span>
                  </div>
                  {booking.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-medium text-success">- KES {booking.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-light-gray pt-2 flex justify-between font-semibold">
                    <span className="text-navy">Total</span>
                    <span className="text-royal">KES {(booking.bookingCost ?? 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {(booking.customerNote || booking.adminNote) && (
              <div className="bg-white rounded-xl border border-light-gray p-5 mb-4 shadow-sm">
                <h2 className="font-semibold text-navy text-sm mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-royal" /> Notes
                </h2>
                {booking.customerNote && (
                  <div className="mb-2">
                    <p className="text-xs text-muted-foreground mb-1">Your note</p>
                    <p className="text-sm text-foreground bg-off-white rounded-lg p-3 border border-light-gray">
                      {booking.customerNote}
                    </p>
                  </div>
                )}
                {booking.adminNote && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Admin note</p>
                    <p className="text-sm text-foreground bg-royal/5 rounded-lg p-3 border border-royal/20">
                      {booking.adminNote}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Cancel */}
            {canCancel && (
              <div className="bg-danger/5 border border-danger/20 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-navy text-sm">Cancel this booking</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cancellation may be subject to the booking policy.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="bg-danger hover:bg-danger/90 text-white shrink-0"
                  >
                    {cancelling ? "Cancelling..." : "Cancel Booking"}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </CustomerLayout>
  )
}
