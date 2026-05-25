"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  Car,
  ArrowLeft,
  Fuel,
  Settings2,
  Users,
  Calendar,
  MapPin,
  FileText,
  XCircle,
  ShieldAlert,
  Clock3,
} from "lucide-react"
import { CustomerLayout } from "@/components/customer-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { carService } from "@/services/carServices"
import { bookingService } from "@/services/bookingServices"
import { profileService } from "@/services/profileService"
import { Car as CarType } from "@/types"
import useAuthStore from "@/store/authStore"

function CarDetailSkeleton() {
  return (
    <div className="grid lg:grid-cols-5 gap-6 animate-pulse">
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-white rounded-xl border border-light-gray h-80" />
        <div className="bg-white rounded-xl border border-light-gray h-48" />
      </div>
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl border border-light-gray h-96" />
      </div>
    </div>
  )
}

export default function CarDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const openCalendar = searchParams.get("openCalendar") === "true"
  const { user, setUser } = useAuthStore()
  const [car, setCar] = useState<CarType | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [destination, setDestination] = useState("")
  const [note, setNote] = useState("")
  const [isBooking, setIsBooking] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [bookedRanges, setBookedRanges] = useState<{ startDate: string; endDate: string }[]>([])

  useEffect(() => {
    carService
      .getCarById(id)
      .then(setCar)
      .catch(() => setLoadError("Failed to load car details."))
      .finally(() => setLoading(false))

    carService
      .getBookedDateRanges(id)
      .then(setBookedRanges)
      .catch(() => {})
  }, [id])

  useEffect(() => {
    if (user?.id) {
      profileService.getMyProfile(user.id).then(setUser).catch(() => {})
    }
  }, [])

  const days =
    startDate && endDate
      ? Math.max(1, Math.ceil(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000,
        ))
      : 0
  const totalCost = car ? days * car.pricePerDay : 0

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!car) return
    setBookingError(null)
    setIsBooking(true)
    try {
      await bookingService.createBooking({
        carId: car.id,
        startDate,
        endDate,
        travelDestination: destination,
        customerNote: note || undefined,
      })
      router.push("/bookings")
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message
      setBookingError(message ?? "Booking failed. Please try again.")
    } finally {
      setIsBooking(false)
    }
  }

  return (
    <CustomerLayout
      breadcrumbs={[
        { label: "Browse Cars", href: "/cars" },
        { label: car ? `${car.brand} ${car.model}` : "Car Details" },
      ]}
    >
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/cars"
          className="flex items-center gap-2 text-muted-foreground hover:text-navy text-sm mb-6 w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Cars
        </Link>

        {loadError && (
          <div className="flex items-center gap-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3 mb-4">
            <XCircle className="h-4 w-4 shrink-0" />
            {loadError}
          </div>
        )}

        {loading ? (
          <CarDetailSkeleton />
        ) : !car ? (
          <div className="text-center py-16 text-muted-foreground">
            <Car className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Car not found</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Left: Car info */}
            <div className="lg:col-span-3 space-y-4">
              {/* Image */}
              <div className="bg-white rounded-xl border border-light-gray overflow-hidden shadow-sm">
                <div className="bg-off-white h-64 flex items-center justify-center">
                  <Car className="h-32 w-32 text-navy/20" />
                </div>
                <div className="flex gap-2 p-3 border-t border-light-gray">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 w-20 bg-off-white rounded-lg border border-light-gray flex items-center justify-center cursor-pointer hover:border-royal/40 transition-colors"
                    >
                      <Car className="h-8 w-8 text-navy/20" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="bg-white rounded-xl border border-light-gray p-5 shadow-sm">
                <h1 className="text-xl font-bold text-navy mb-1">
                  {car.brand} {car.model} {car.yearOfManufacture}
                </h1>
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      car.isAvailable
                        ? "bg-success/10 text-success border border-success/20"
                        : "bg-danger/10 text-danger border border-danger/20"
                    }`}
                  >
                    {car.isAvailable ? "Available" : "Unavailable"}
                  </span>
                  <span className="text-xs text-muted-foreground">{car.numberPlate}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="flex flex-col items-center gap-1 bg-off-white rounded-lg p-3">
                    <Fuel className="h-5 w-5 text-royal" />
                    <span className="text-xs text-muted-foreground">Fuel</span>
                    <span className="text-sm font-medium text-navy">{car.typeOfFuel}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 bg-off-white rounded-lg p-3">
                    <Settings2 className="h-5 w-5 text-royal" />
                    <span className="text-xs text-muted-foreground">Trans.</span>
                    <span className="text-sm font-medium text-navy">{car.transmission}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 bg-off-white rounded-lg p-3">
                    <Users className="h-5 w-5 text-royal" />
                    <span className="text-xs text-muted-foreground">Seats</span>
                    <span className="text-sm font-medium text-navy">{car.numberOfPassengers}</span>
                  </div>
                </div>
                <h2 className="font-semibold text-navy mb-2 text-sm">Description</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">{car.description}</p>
              </div>
            </div>

            {/* Right: Booking panel */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-light-gray shadow-sm sticky top-20">
                <div className="p-5 border-b border-light-gray">
                  <h2 className="font-bold text-navy text-lg">
                    {car.brand} {car.model}
                  </h2>
                  <p className="text-2xl font-bold text-royal mt-1">
                    KES {car.pricePerDay.toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground"> /day</span>
                  </p>
                </div>

                {/* Verification gate */}
                {!user?.isVerified ? (
                  <div className="p-5">
                    {user?.idFrontPhoto && user?.idBackPhoto ? (
                      <div className="flex flex-col items-center gap-3 py-4 text-center">
                        <div className="h-12 w-12 rounded-xl bg-azure/10 border border-azure/20 flex items-center justify-center">
                          <Clock3 className="h-6 w-6 text-azure" />
                        </div>
                        <div>
                          <p className="font-semibold text-navy text-sm">Verification pending</p>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            Your ID documents are under review. Our team will verify your account within 24 hours — then you can book.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 py-4 text-center">
                        <div className="h-12 w-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                          <ShieldAlert className="h-6 w-6 text-gold" />
                        </div>
                        <div>
                          <p className="font-semibold text-navy text-sm">Verification required</p>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            You must upload your National ID and be verified by our team before you can make a booking.
                          </p>
                        </div>
                        <Link href={`/profile/${user?.id}`} className="w-full">
                          <Button className="w-full h-10 bg-gold text-navy hover:bg-gold/90 font-bold gap-2">
                            Upload ID to Get Verified
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {bookingError && (
                      <div className="mx-5 mt-4 bg-danger/10 border border-danger/20 text-danger text-xs rounded-lg px-3 py-2">
                        {bookingError}
                      </div>
                    )}

                    <form onSubmit={handleBook} className="p-5 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-navy mb-1.5 flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" /> Pick Up → Return Dates
                        </label>
                        <DateRangePicker
                          startDate={startDate}
                          endDate={endDate}
                          bookedRanges={bookedRanges}
                          defaultOpen={openCalendar}
                          onRangeChange={(start, end) => {
                            setStartDate(start)
                            setEndDate(end)
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-navy mb-1.5 flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" /> Travel Destination
                        </label>
                        <Input
                          placeholder="e.g. Mombasa"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          className="h-10"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-navy mb-1.5 flex items-center gap-1.5">
                          <FileText className="h-4 w-4" /> Notes{" "}
                          <span className="font-normal text-muted-foreground">(Optional)</span>
                        </label>
                        <Input
                          placeholder="Any special requests..."
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          className="h-10"
                        />
                      </div>

                      {days > 0 && (
                        <div className="bg-off-white rounded-lg p-3 border border-light-gray space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Pick-up</span>
                            <span className="font-medium text-navy">
                              {startDate.length >= 16 ? startDate.slice(0, 16).replace("T", " ") : ""}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Return</span>
                            <span className="font-medium text-navy">
                              {endDate.length >= 16 ? endDate.slice(0, 16).replace("T", " ") : ""}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Duration</span>
                            <span className="font-medium text-navy">{days} day{days !== 1 ? "s" : ""}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Rate</span>
                            <span className="font-medium text-navy">KES {car.pricePerDay.toLocaleString()} /day</span>
                          </div>
                          <div className="border-t border-light-gray pt-1 mt-1 flex justify-between">
                            <span className="font-semibold text-navy">Total</span>
                            <span className="font-bold text-royal text-base">KES {totalCost.toLocaleString()}</span>
                          </div>
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={isBooking || !car.isAvailable || !startDate || !endDate || !destination}
                        className="w-full h-11 bg-navy hover:bg-royal font-semibold gap-2"
                      >
                        {isBooking ? "Booking..." : "Book This Car →"}
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  )
}
