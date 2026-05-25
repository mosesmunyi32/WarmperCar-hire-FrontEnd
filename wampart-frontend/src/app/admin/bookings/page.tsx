"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Gauge, Search, UserPlus, SlidersHorizontal, X, Car as CarIcon, AlertTriangle, Clock, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { bookingService } from "@/services/bookingServices"
import { carService } from "@/services/carServices"
import { customerServices } from "@/services/customerServices"
import { AdminBooking, AdminCar, UserResponse } from "@/types"
import { BOOKING_TABS, BookingTab, SortOption } from "@/components/bookings/booking-filters"
import { format, differenceInHours, differenceInMinutes, isPast } from "date-fns"
import { cn } from "@/lib/utils"

type PageTab = BookingTab | "ON_TRIP"

function formatDate(iso: string) {
  try { return format(new Date(iso), "MMM d, yyyy") } catch { return iso }
}

function TableSkeleton() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <tr key={i} className="border-b border-light-gray animate-pulse">
          {[0, 1, 2, 3, 4, 5, 6].map((j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-3.5 bg-light-gray rounded w-24" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

// ── Trip deadline helpers ──────────────────────────────────────────────────────
type TripUrgency = "overdue" | "approaching" | "on-track"

function getTripUrgency(endDateIso: string): TripUrgency {
  const end = new Date(endDateIso)
  if (isPast(end)) return "overdue"
  if (differenceInHours(end, new Date()) <= 12) return "approaching"
  return "on-track"
}

function TripCountdown({ endDateIso }: { endDateIso: string }) {
  const end = new Date(endDateIso)
  const urgency = getTripUrgency(endDateIso)
  const now = new Date()

  if (urgency === "overdue") {
    const hoursLate = Math.abs(differenceInHours(now, end))
    const minsLate = Math.abs(differenceInMinutes(now, end)) % 60
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-danger text-white">
        <AlertTriangle className="h-3 w-3" />
        Overdue by {hoursLate > 0 ? `${hoursLate}h ` : ""}{minsLate}m — Contact customer
      </span>
    )
  }

  const hoursLeft = differenceInHours(end, now)
  const minsLeft = differenceInMinutes(end, now) % 60

  if (urgency === "approaching") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-warning text-white">
        <Clock className="h-3 w-3" />
        Approaching — {hoursLeft > 0 ? `${hoursLeft}h ` : ""}{minsLeft}m left
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-success/10 text-success border border-success/20">
      <CheckCircle2 className="h-3 w-3" />
      Returns {hoursLeft >= 24 ? `in ${Math.floor(hoursLeft / 24)}d ${hoursLeft % 24}h` : `in ${hoursLeft}h ${minsLeft}m`}
    </span>
  )
}

// ── Cars on Trip card list ─────────────────────────────────────────────────────
function CarsOnTripList({
  bookings,
  carMap,
  customerMap,
  loading,
  onNavigate,
}: {
  bookings: AdminBooking[]
  carMap: Map<string, AdminCar>
  customerMap: Map<string, UserResponse>
  loading: boolean
  onNavigate: (id: string) => void
}) {
  const onTrip = bookings.filter(
    (b) => b.bookingStatus === "CONFIRMED" && b.mileageStart != null && b.mileageEnd == null
  )

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-light-gray p-5 h-24 animate-pulse" />
        ))}
      </div>
    )
  }

  if (onTrip.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-light-gray p-12 text-center text-muted-foreground">
        <CarIcon className="h-10 w-10 mx-auto mb-3 opacity-20" />
        <p className="font-medium">No cars currently out on trip</p>
        <p className="text-sm mt-1">Confirmed bookings with recorded start mileage will appear here.</p>
      </div>
    )
  }

  // Sort: overdue first, then approaching, then on-track
  const urgencyOrder: Record<TripUrgency, number> = { overdue: 0, approaching: 1, "on-track": 2 }
  const sorted = [...onTrip].sort(
    (a, b) => urgencyOrder[getTripUrgency(a.endDate)] - urgencyOrder[getTripUrgency(b.endDate)]
  )

  return (
    <div className="space-y-3">
      {sorted.map((b) => {
        const car = carMap.get(b.carId)
        const customer = customerMap.get(b.userId)
        const urgency = getTripUrgency(b.endDate)
        return (
          <div
            key={b.id}
            onClick={() => onNavigate(b.id)}
            className={cn(
              "bg-white rounded-xl border px-5 py-4 cursor-pointer hover:shadow-md transition-all",
              urgency === "overdue" && "border-danger/30 bg-danger/5",
              urgency === "approaching" && "border-warning/30 bg-warning/5",
              urgency === "on-track" && "border-light-gray",
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                  urgency === "overdue" && "bg-danger/10",
                  urgency === "approaching" && "bg-warning/10",
                  urgency === "on-track" && "bg-navy/5",
                )}>
                  <CarIcon className={cn(
                    "h-5 w-5",
                    urgency === "overdue" && "text-danger",
                    urgency === "approaching" && "text-warning",
                    urgency === "on-track" && "text-navy/50",
                  )} />
                </div>
                <div>
                  <p className="font-semibold text-navy text-sm">
                    {car ? `${car.brand} ${car.model}` : b.carId}
                    {car && <span className="font-normal text-muted-foreground ml-1.5 text-xs">{car.numberPlate}</span>}
                  </p>
                  {customer && (
                    <p className="text-xs text-muted-foreground">
                      {customer.firstName} {customer.lastName}
                      {customer.phoneNumber && <span> · {customer.phoneNumber}</span>}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground font-mono">{b.bookingReference}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <TripCountdown endDateIso={b.endDate} />
                <p className="text-[11px] text-muted-foreground">
                  Due back: <span className="font-medium text-navy">{formatDate(b.endDate)}</span>
                  {b.travelDestination && <span> · {b.travelDestination}</span>}
                </p>
                {b.mileageStart != null && (
                  <p className="text-[11px] text-muted-foreground">
                    Start mileage: <span className="font-medium text-navy">{b.mileageStart.toLocaleString()} km</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function AdminBookingsPage() {
  const router = useRouter()
  const [tab, setTab] = useState<PageTab>("PENDING")
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [carMap, setCarMap] = useState<Map<string, AdminCar>>(new Map())
  const [customerMap, setCustomerMap] = useState<Map<string, UserResponse>>(new Map())
  const [loading, setLoading] = useState(true)

  const onTripCount = bookings.filter(
    (b) => b.bookingStatus === "CONFIRMED" && b.mileageStart != null && b.mileageEnd == null
  ).length

  useEffect(() => {
    Promise.all([
      bookingService.getAllBookings(),
      carService.getAllCarsForAdmin(),
      customerServices.getAllCustomers().catch(() => [] as UserResponse[]),
    ])
      .then(([allBookings, allCars, allCustomers]) => {
        setBookings(allBookings)
        setCarMap(new Map(allCars.map((c) => [c.id, c])))
        setCustomerMap(new Map(allCustomers.map((c) => [c.id, c])))
      })
      .catch(() => toast.error("Failed to load bookings. Please refresh."))
      .finally(() => setLoading(false))
  }, [])

  const filtered = bookings
    .filter((b) => {
      if (tab === "ON_TRIP") return false
      if (b.bookingStatus !== tab) return false;
      const car = carMap.get(b.carId)
      const carLabel = car ? `${car.numberPlate} ${car.brand} ${car.model}` : b.carId
      if (!`${carLabel} ${b.bookingReference}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (dateFrom && new Date(b.startDate) < new Date(dateFrom)) return false;
      if (dateTo && new Date(b.startDate) > new Date(dateTo)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "price-desc") return (b.bookingCost ?? 0) - (a.bookingCost ?? 0);
      if (sortBy === "price-asc") return (a.bookingCost ?? 0) - (b.bookingCost ?? 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Manage Bookings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {loading ? "Loading..." : `${bookings.length} total booking${bookings.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link href="/admin/bookings/create-for-customer">
          <Button className="bg-navy hover:bg-royal gap-2 shrink-0">
            <UserPlus className="h-4 w-4" /> Book for Customer
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="space-y-2 mb-4">
        <div className="flex gap-1 bg-white border border-light-gray rounded-lg p-1 overflow-x-auto">
          {BOOKING_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t ? "bg-navy text-white" : "text-muted-foreground hover:text-navy"
              }`}
            >
              {t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
          <button
            onClick={() => setTab("ON_TRIP")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              tab === "ON_TRIP" ? "bg-navy text-white" : "text-muted-foreground hover:text-navy"
            }`}
          >
            <CarIcon className="h-3.5 w-3.5" />
            Cars on Trip
            {onTripCount > 0 && (
              <span className={cn(
                "inline-flex items-center justify-center h-4.5 min-w-4.5 px-1 text-[10px] font-bold rounded-full",
                tab === "ON_TRIP" ? "bg-white/20 text-white" : "bg-danger text-white"
              )}>
                {onTripCount}
              </span>
            )}
          </button>
        </div>

        {tab !== "ON_TRIP" && (
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-44">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by car or reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 bg-white"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-9 rounded-lg border border-input bg-white px-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="price-asc">Price: Low → High</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Start date:</span>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 w-36 bg-white text-sm"
              />
              <span className="text-muted-foreground text-xs">—</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 w-36 bg-white text-sm"
              />
            </div>
            {(search || dateFrom || dateTo || sortBy !== "newest") && (
              <button
                onClick={() => { setSearch(""); setSortBy("newest"); setDateFrom(""); setDateTo(""); }}
                className="flex items-center gap-1 text-xs text-danger hover:text-danger/80 transition-colors"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Cars on Trip */}
      {tab === "ON_TRIP" ? (
        <CarsOnTripList
          bookings={bookings}
          carMap={carMap}
          customerMap={customerMap}
          loading={loading}
          onNavigate={(id) => router.push(`/admin/bookings/${id}`)}
        />
      ) : (
        /* Table */
        <div className="bg-white rounded-xl border border-light-gray shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-light-gray bg-off-white">
                  {["Reference", "Car", "Dates", "Days", "Status", "Total", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray">
                {loading ? (
                  <TableSkeleton />
                ) : filtered.length === 0 ? null : (
                  filtered.map((b) => (
                    <tr
                      key={b.id}
                      className="hover:bg-off-white transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/bookings/${b.id}`)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs text-navy">{b.bookingReference}</p>
                        {(() => {
                          const c = customerMap.get(b.userId)
                          return c ? (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {c.firstName} {c.lastName}
                            </p>
                          ) : null
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const car = carMap.get(b.carId)
                          if (!car) return <span className="text-xs text-muted-foreground font-mono">{b.carId}</span>
                          return (
                            <div>
                              <p className="font-medium text-navy">{car.brand} {car.model}</p>
                              <p className="text-xs text-muted-foreground font-mono">{car.numberPlate}</p>
                            </div>
                          )
                        })()}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(b.startDate)} → {formatDate(b.endDate)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{b.numberOfDays}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <StatusBadge status={b.bookingStatus} />
                          {!b.mileageStart && (b.bookingStatus === "PENDING" || b.bookingStatus === "CONFIRMED") && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-600 w-fit whitespace-nowrap">
                              <Gauge className="h-2.5 w-2.5" /> Start mileage needed
                            </span>
                          )}
                          {b.mileageStart != null && b.mileageEnd == null && b.bookingStatus === "CONFIRMED" && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 w-fit whitespace-nowrap">
                              <Gauge className="h-2.5 w-2.5" /> End mileage needed
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-navy">
                        KES {(b.bookingCost ?? 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-xs text-azure font-medium">View →</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No {tab.charAt(0) + tab.slice(1).toLowerCase()} bookings found.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
