"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Gauge, Search, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { bookingService } from "@/services/bookingServices"
import { carService } from "@/services/carServices"
import { customerServices } from "@/services/customerServices"
import { AdminBooking, AdminCar, UserResponse } from "@/types"
import { BOOKING_TABS, BookingTab } from "@/components/bookings/booking-filters"
import { format } from "date-fns"

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

export default function AdminBookingsPage() {
  const router = useRouter()
  const [tab, setTab] = useState<BookingTab>("PENDING")
  const [search, setSearch] = useState("")
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [carMap, setCarMap] = useState<Map<string, AdminCar>>(new Map())
  const [customerMap, setCustomerMap] = useState<Map<string, UserResponse>>(new Map())
  const [loading, setLoading] = useState(true)

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

  const filtered = bookings.filter((b) => {
    const matchTab = b.bookingStatus === tab
    const q = search.toLowerCase()
    const car = carMap.get(b.carId)
    const carLabel = car ? `${car.numberPlate} ${car.brand} ${car.model}` : b.carId
    return matchTab && `${carLabel} ${b.bookingReference}`.toLowerCase().includes(q)
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
      <div className="flex flex-wrap gap-3 mb-4 items-center">
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
        </div>
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by car or reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-white"
          />
        </div>
      </div>

      {/* Table */}
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
    </div>
  )
}
