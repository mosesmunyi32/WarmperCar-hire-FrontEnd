"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Car, Calendar, MapPin, FileText, AlertTriangle, XCircle, Download, Fuel, Settings2, Users, Palette, ClipboardList, RefreshCw, Smartphone, RefreshCcw, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { CustomerLayout } from "@/components/customer-layout"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { bookingService } from "@/services/bookingServices"
import { carService } from "@/services/carServices"
import { inspectionService } from "@/services/inspectionService"
import { Booking, Car as CarType, CustomerInspectionResponse, InspectionRespondRequest } from "@/types"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { toast } from "sonner"
import Image from "next/image"
import { CustomerInspectionCard } from "@/components/inspection/inspection-card"

function formatDate(iso: string) {
  try { return format(new Date(iso), "MMM d, yyyy") } catch { return iso }
}

function InspectionTabs({
  inspections,
  onRespond,
  respondingId,
}: {
  inspections: CustomerInspectionResponse[]
  onRespond: (id: string, data: InspectionRespondRequest) => Promise<void>
  respondingId: string | null
}) {
  const [activeTab, setActiveTab] = useState<"PRE" | "POST">("PRE")
  const pre = inspections.find((i) => i.inspectionType === "PRE_INSPECTION")
  const post = inspections.find((i) => i.inspectionType === "POST_INSPECTION")
  const hasPre = !!pre
  const hasPost = !!post

  const pendingPre = pre?.customerResponse === "PENDING"
  const pendingPost = post?.customerResponse === "PENDING"

  return (
    <div className="bg-white rounded-xl border border-light-gray mb-4 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 pt-4 pb-0 border-b border-light-gray">
        <ClipboardList className="h-4 w-4 text-royal shrink-0" />
        <h2 className="font-semibold text-navy text-sm mr-3">Inspections</h2>
        <div className="flex gap-1">
          {(["PRE", "POST"] as const).map((t) => {
            const label = t === "PRE" ? "Pre-Inspection" : "Post-Inspection"
            const exists = t === "PRE" ? hasPre : hasPost
            const pending = t === "PRE" ? pendingPre : pendingPost
            return (
              <button
                key={t}
                type="button"
                onClick={() => setActiveTab(t)}
                className={`relative flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px ${
                  activeTab === t
                    ? "border-royal text-royal"
                    : "border-transparent text-muted-foreground hover:text-navy"
                }`}
              >
                {label}
                {exists && (
                  <span className={`h-1.5 w-1.5 rounded-full ${pending ? "bg-warning" : "bg-success"}`} />
                )}
                {!exists && (
                  <span className="text-[10px] text-muted-foreground font-normal">(none)</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
      <div className="p-5">
        {activeTab === "PRE" && (
          pre ? (
            <CustomerInspectionCard
              inspection={pre}
              onRespond={(data) => onRespond(pre.id, data)}
              responding={respondingId === pre.id}
            />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No pre-inspection recorded yet.</p>
          )
        )}
        {activeTab === "POST" && (
          post ? (
            <CustomerInspectionCard
              inspection={post}
              onRespond={(data) => onRespond(post.id, data)}
              responding={respondingId === post.id}
            />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No post-inspection recorded yet.</p>
          )
        )}
      </div>
    </div>
  )
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
  const [car, setCar] = useState<CarType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [inspections, setInspections] = useState<CustomerInspectionResponse[]>([])
  const [respondingId, setRespondingId] = useState<string | null>(null)
  const [checkingReceipt, setCheckingReceipt] = useState(false)
  const [showSwap, setShowSwap] = useState(false)
  const [swapCars, setSwapCars] = useState<CarType[]>([])
  const [swapLoading, setSwapLoading] = useState(false)
  const [selectedSwapCarId, setSelectedSwapCarId] = useState("")
  const [swapping, setSwapping] = useState(false)

  useEffect(() => {
    bookingService
      .getBookingById(id)
      .then((b) => {
        setBooking(b)
        carService.getCarById(b.carId).then(setCar).catch(() => {})
        inspectionService.getBookingInspectionsForCustomer(b.id).then(setInspections).catch(() => {})
        // Customer booking endpoint may not include receiptUrl — fetch it separately
        if (b.bookingStatus === "CONFIRMED" || b.bookingStatus === "COMPLETED") {
          bookingService.getReceiptUrl(b.id)
            .then((url) => { if (url) setBooking((prev) => prev ? { ...prev, receiptUrl: url } : prev) })
            .catch(() => {})
        }
      })
      .catch(() => setError("Failed to load booking details."))
      .finally(() => setLoading(false))
  }, [id])

  // Poll for receipt every 30s while it hasn't been generated yet
  useEffect(() => {
    if (!booking || booking.receiptUrl) return
    if (booking.bookingStatus !== "CONFIRMED" && booking.bookingStatus !== "COMPLETED") return
    const timer = setInterval(async () => {
      try {
        const url = await bookingService.getReceiptUrl(booking.id)
        if (url) setBooking((prev) => prev ? { ...prev, receiptUrl: url } : prev)
      } catch {}
    }, 30000)
    return () => clearInterval(timer)
  }, [booking?.receiptUrl, booking?.bookingStatus, booking?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCheckReceipt = async () => {
    if (!booking) return
    setCheckingReceipt(true)
    try {
      const url = await bookingService.getReceiptUrl(booking.id)
      if (url) {
        setBooking((prev) => prev ? { ...prev, receiptUrl: url } : prev)
      } else {
        toast.info("Receipt has not been generated yet.")
      }
    } catch {
      toast.info("Receipt has not been generated yet.")
    } finally {
      setCheckingReceipt(false)
    }
  }

  const handleRespond = async (inspectionId: string, data: InspectionRespondRequest) => {
    setRespondingId(inspectionId)
    try {
      const updated = await inspectionService.respondToInspection(inspectionId, data)
      setInspections((prev) => prev.map((i) => (i.id === inspectionId ? updated : i)))
      toast.success(data.customerResponse === "CONFIRMED" ? "Inspection confirmed." : "Dispute submitted.")
    } catch {
      toast.error("Failed to submit response.")
    } finally {
      setRespondingId(null)
    }
  }

  const handleOpenSwap = async () => {
    if (!booking) return
    if (showSwap) { setShowSwap(false); return; }
    setShowSwap(true)
    if (swapCars.length > 0) return
    setSwapLoading(true)
    try {
      const allCars = await carService.getAllAvailableCars()
      const candidates = allCars.filter((c) => c.id !== booking.carId)
      const bookingStart = new Date(booking.startDate)
      const bookingEnd = new Date(booking.endDate)

      const rangeResults = await Promise.allSettled(
        candidates.map((c) => carService.getBookedDateRanges(c.id))
      )

      const available = candidates.filter((_, i) => {
        const res = rangeResults[i]
        if (res.status === "rejected") return true
        return !res.value.some(
          (r) =>
            new Date(r.startDate) <= bookingEnd &&
            new Date(r.endDate) >= bookingStart
        )
      })
      setSwapCars(available)
    } catch {
      toast.error("Failed to load available cars.")
      setShowSwap(false)
    } finally {
      setSwapLoading(false)
    }
  }

  const handleSwap = async () => {
    if (!booking || !selectedSwapCarId) return
    const selectedCar = swapCars.find((c) => c.id === selectedSwapCarId)
    if (!selectedCar) return
    setSwapping(true)
    try {
      await bookingService.reassignCar(booking.id, selectedCar.numberPlate)
      toast.success(`Booking switched to ${selectedCar.brand} ${selectedCar.model}.`)
      setBooking((prev) => prev ? {
        ...prev,
        carId: selectedCar.id,
        carBrand: selectedCar.brand,
        carModel: selectedCar.model,
        carNumberPlate: selectedCar.numberPlate,
      } : prev)
      setCar(selectedCar)
      setShowSwap(false)
      setSelectedSwapCarId("")
      setSwapCars([])
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? "Failed to swap car. Please contact support.")
    } finally {
      setSwapping(false)
    }
  }

  const handleCancel = async () => {
    if (!booking) return
    setCancelling(true)
    try {
      const updated = await bookingService.cancelBooking(booking.id)
      setBooking(updated)
      toast.success("Booking cancelled successfully.")
    } catch {
      toast.error("Failed to cancel booking. Please try again.")
    } finally {
      setCancelling(false)
    }
  }

  const canCancel = booking?.bookingStatus === "PENDING" || booking?.bookingStatus === "CONFIRMED"

  const handleOpenReceipt = () => {
    if (!booking?.receiptUrl) return
    window.open(booking.receiptUrl, "_blank", "noopener,noreferrer")
  }

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
            {/* Payment note for pending bookings */}
            {booking.bookingStatus === "PENDING" && (
              <div className="bg-gold/10 border border-gold/30 rounded-xl p-4 mb-4 flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-gold/20 flex items-center justify-center shrink-0">
                  <Smartphone className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="font-semibold text-navy text-sm">Payment Required to Confirm Booking</p>
                  <p className="text-sm text-foreground mt-1">
                    To confirm your booking, please send payment via M-Pesa to{" "}
                    <strong className="text-navy font-bold">0721483055</strong>.
                    Your booking will be confirmed once payment is received and verified by our team.
                  </p>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="bg-white rounded-xl border border-light-gray p-5 mb-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                <div className="text-right flex flex-col items-end gap-2">
                  <p className="text-2xl font-bold text-royal">KES {(booking.bookingCost ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {booking.numberOfDays} day{booking.numberOfDays !== 1 ? "s" : ""} × KES {booking.pricePerDay.toLocaleString()}
                  </p>
                  {booking.receiptUrl ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleOpenReceipt}
                      className="border-royal/30 text-royal hover:bg-royal/5 gap-1.5 text-xs h-8"
                    >
                      <Download className="h-3.5 w-3.5" /> View Receipt
                    </Button>
                  ) : (booking.bookingStatus === "CONFIRMED" || booking.bookingStatus === "COMPLETED") ? (
                    <button
                      onClick={handleCheckReceipt}
                      disabled={checkingReceipt}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-royal transition-colors disabled:opacity-60"
                    >
                      <RefreshCw className={`h-3 w-3 ${checkingReceipt ? "animate-spin" : ""}`} />
                      {checkingReceipt ? "Checking…" : "Receipt not yet generated — tap to check"}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Car Details */}
            <Link
              href={`/cars/${booking.carId}`}
              className="block bg-white rounded-xl border border-light-gray mb-4 shadow-sm overflow-hidden hover:border-royal/40 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Image */}
                <div className="sm:w-48 h-36 sm:h-auto bg-linear-to-br from-navy to-royal flex items-center justify-center shrink-0 relative">
                  {car?.images?.[0] ? (
                    <Image
                      src={car.images[0]}
                      alt={`${car.brand} ${car.model}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <Car className="h-16 w-16 text-white/20" />
                  )}
                  <div className="absolute bottom-0 inset-x-0 h-0.5 bg-linear-to-r from-transparent via-gold/50 to-transparent" />
                </div>

                {/* Info */}
                <div className="p-5 flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h2 className="font-bold text-navy text-base group-hover:text-royal transition-colors">
                        {car ? `${car.brand} ${car.model}` : `${booking.carBrand ?? ""} ${booking.carModel ?? ""}`.trim() || "Vehicle"}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {car?.yearOfManufacture && `${car.yearOfManufacture} · `}
                        {booking.carNumberPlate ?? car?.numberPlate}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        car?.isAvailable
                          ? "bg-success/10 text-success border border-success/20"
                          : "bg-muted text-muted-foreground border border-light-gray"
                      }`}>
                        {car?.isAvailable ? "Available" : "In Use"}
                      </span>
                      <span className="text-xs text-royal font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        View details →
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { icon: Fuel, label: "Fuel", value: car?.typeOfFuel },
                      { icon: Settings2, label: "Trans.", value: car?.transmission },
                      { icon: Users, label: "Seats", value: car?.numberOfPassengers ? `${car.numberOfPassengers}` : undefined },
                      { icon: Palette, label: "Color", value: car?.color },
                    ].map(({ icon: Icon, label, value }) =>
                      value ? (
                        <div key={label} className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-off-white border border-light-gray flex items-center justify-center shrink-0">
                            <Icon className="h-3.5 w-3.5 text-royal" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground leading-none">{label}</p>
                            <p className="text-xs font-semibold text-navy truncate capitalize">{value.toLowerCase()}</p>
                          </div>
                        </div>
                      ) : null
                    )}
                  </div>

                  {car?.description && (
                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed line-clamp-2">
                      {car.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>

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

            {/* Swap car — PENDING only */}
            {booking.bookingStatus === "PENDING" && (
              <div className="bg-white rounded-xl border border-light-gray mb-4 shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={handleOpenSwap}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-off-white transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-royal/10 border border-royal/20 flex items-center justify-center shrink-0">
                      <RefreshCcw className="h-4 w-4 text-royal" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-navy text-sm">Change Car</p>
                      <p className="text-xs text-muted-foreground">
                        Switch to another car — your dates and destination stay the same
                      </p>
                    </div>
                  </div>
                  {showSwap ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>

                {showSwap && (
                  <div className="border-t border-light-gray px-5 py-4">
                    {swapLoading ? (
                      <div className="space-y-2">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="h-14 bg-light-gray rounded-lg animate-pulse" />
                        ))}
                        <p className="text-xs text-muted-foreground text-center pt-1">Checking availability for your dates…</p>
                      </div>
                    ) : swapCars.length === 0 ? (
                      <div className="text-center py-6">
                        <Car className="h-8 w-8 text-light-gray mx-auto mb-2" />
                        <p className="text-sm font-medium text-navy">No other cars available for your dates</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          All other vehicles are booked from {formatDate(booking.startDate)} to {formatDate(booking.endDate)}.
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-muted-foreground mb-3">
                          <span className="font-semibold text-navy">{swapCars.length}</span> car{swapCars.length !== 1 ? "s" : ""} available from{" "}
                          <span className="font-semibold text-navy">{formatDate(booking.startDate)}</span> to{" "}
                          <span className="font-semibold text-navy">{formatDate(booking.endDate)}</span>.
                        </p>
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1 mb-4">
                          {swapCars.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setSelectedSwapCarId(c.id)}
                              className={cn(
                                "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg border text-left transition-all",
                                selectedSwapCarId === c.id
                                  ? "border-royal bg-royal/5 shadow-sm"
                                  : "border-light-gray hover:border-royal/40"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-navy/5 flex items-center justify-center shrink-0">
                                  <Car className="h-4 w-4 text-navy/50" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-navy">
                                    {c.brand} {c.model}{" "}
                                    <span className="font-normal text-muted-foreground">· {c.yearOfManufacture}</span>
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {c.numberPlate} · KES {c.pricePerDay.toLocaleString()}/day
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0 bg-success/10 text-success border border-success/20">
                                Available
                              </span>
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={handleSwap}
                            disabled={!selectedSwapCarId || swapping}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-royal text-white text-sm font-semibold hover:bg-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <RefreshCcw className="h-4 w-4" />
                            {swapping ? "Switching…" : "Confirm Switch"}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setShowSwap(false); setSelectedSwapCarId(""); }}
                            disabled={swapping}
                            className="text-sm text-muted-foreground hover:text-navy transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Inspections */}
            {inspections.length > 0 && (
              <InspectionTabs
                inspections={inspections}
                onRespond={handleRespond}
                respondingId={respondingId}
              />
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
