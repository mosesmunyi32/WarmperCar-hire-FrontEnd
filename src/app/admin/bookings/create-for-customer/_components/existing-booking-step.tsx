"use client"

import { useEffect, useState } from "react"
import { ArrowRight, CalendarDays, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminCar, UserResponse } from "@/types"
import { BookingForm } from "./types"
import { CustomerSelector } from "./customer-selector"
import { CarSelector } from "./car-selector"
import { BookingFields } from "./booking-fields"
import { carService } from "@/services/carServices"

export function ExistingBookingStep({
  customers,
  selectedCustomer,
  onCustomerChange,
  cars,
  selectedCar,
  onCarChange,
  bookingForm,
  onBookingChange,
  onSubmit,
  submitting,
}: {
  customers: UserResponse[]
  selectedCustomer: UserResponse | null
  onCustomerChange: (c: UserResponse | null) => void
  cars: AdminCar[]
  selectedCar: AdminCar | null
  onCarChange: (car: AdminCar | null) => void
  bookingForm: BookingForm
  onBookingChange: (k: keyof BookingForm, v: string) => void
  onSubmit: () => void
  submitting: boolean
}) {
  const [bookedRanges, setBookedRanges] = useState<{ startDate: string; endDate: string }[]>([])

  useEffect(() => {
    if (!selectedCar) { setBookedRanges([]); return }
    carService.getBookedDateRanges(selectedCar.id).then(setBookedRanges).catch(() => {})
  }, [selectedCar?.id])

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-light-gray shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Users className="h-4 w-4 text-royal" />
          <h2 className="font-semibold text-navy text-sm">Select Customer</h2>
        </div>
        <CustomerSelector customers={customers} value={selectedCustomer} onChange={onCustomerChange} />
      </div>

      <div className="bg-white rounded-xl border border-light-gray shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <CalendarDays className="h-4 w-4 text-royal" />
          <h2 className="font-semibold text-navy text-sm">Booking Details</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <CarSelector cars={cars} value={selectedCar} onChange={onCarChange} />
          </div>
          <BookingFields form={bookingForm} onChange={onBookingChange} bookedRanges={bookedRanges} />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onSubmit}
          disabled={submitting || (!!selectedCustomer && !selectedCustomer.idNumber)}
          className="bg-navy hover:bg-royal gap-2 px-8"
        >
          {submitting ? (
            "Creating Booking…"
          ) : (
            <>
              <span>Create Booking</span> <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
