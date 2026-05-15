import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { AdminBooking } from "@/types";
import { fmt } from "./types";

export function BookingHistory({ bookings }: { bookings: AdminBooking[] }) {
  return (
    <div className="bg-white rounded-xl border border-light-gray p-5 shadow-sm">
      <h2 className="font-semibold text-navy text-sm mb-4 flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-royal" /> Booking History
        <span className="ml-auto text-xs text-muted-foreground">
          {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
        </span>
      </h2>
      {bookings.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">No bookings yet.</p>
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
      )}
    </div>
  );
}
