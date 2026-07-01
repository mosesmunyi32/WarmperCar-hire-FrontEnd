import { CalendarDays, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminCar } from "@/types"

export function SuccessScreen({
  customerName,
  selectedCar,
  onViewBookings,
  onNewBooking,
}: {
  customerName: string
  selectedCar: AdminCar | null
  onViewBookings: () => void
  onNewBooking: () => void
}) {
  return (
    <div className="max-w-lg mx-auto py-16 flex flex-col items-center text-center gap-4">
      <div className="h-16 w-16 rounded-full bg-success/10 border border-success/20 flex items-center justify-center">
        <CheckCircle className="h-8 w-8 text-success" />
      </div>
      <h2 className="text-2xl font-bold text-navy">Booking Created!</h2>
      <p className="text-muted-foreground text-sm leading-relaxed">
        A booking has been created for <strong className="text-navy">{customerName}</strong>
        {selectedCar && (
          <>
            {" "}
            for the{" "}
            <strong className="text-navy">
              {selectedCar.brand} {selectedCar.model}
            </strong>{" "}
            ({selectedCar.numberPlate})
          </>
        )}
        .
      </p>
      <div className="flex gap-3 mt-2">
        <Button onClick={onViewBookings} className="bg-navy hover:bg-royal gap-2">
          <CalendarDays className="h-4 w-4" /> View Bookings
        </Button>
        <Button variant="outline" onClick={onNewBooking} className="border-navy/20 text-navy">
          New Booking
        </Button>
      </div>
    </div>
  )
}
