"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminCar, AdminCreateCustomerResponse } from "@/types"
import { BookingForm } from "./types"
import { CarSelector } from "./car-selector"
import { BookingFields } from "./booking-fields"
import { carService } from "@/services/carServices"

export function BookingStep({
  createdCustomer,
  cars,
  selectedCar,
  onCarChange,
  bookingForm,
  onBookingChange,
  onBack,
  onSubmit,
  submitting,
}: {
  createdCustomer: AdminCreateCustomerResponse | null
  cars: AdminCar[]
  selectedCar: AdminCar | null
  onCarChange: (car: AdminCar | null) => void
  bookingForm: BookingForm
  onBookingChange: (k: keyof BookingForm, v: string) => void
  onBack: () => void
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
      {createdCustomer && (
        <div className="flex items-center gap-4 rounded-xl border border-success/30 bg-success/6 px-5 py-4">
          <div className="h-10 w-10 rounded-full bg-success/15 border border-success/25 flex items-center justify-center shrink-0 text-success font-bold text-sm">
            {createdCustomer.firstName[0]}{createdCustomer.lastName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-navy text-sm">
              {createdCustomer.firstName} {createdCustomer.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{createdCustomer.email}</p>
          </div>
          <span className="text-xs font-medium text-success bg-success/10 border border-success/20 px-2.5 py-1 rounded-full shrink-0">
            Account Created
          </span>
        </div>
      )}

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

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="border-navy/20 text-navy gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button onClick={onSubmit} disabled={submitting} className="bg-navy hover:bg-royal gap-2 px-8">
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
