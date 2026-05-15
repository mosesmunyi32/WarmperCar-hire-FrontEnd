import Link from "next/link";
import { Car } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Booking } from "@/types";
import { format } from "date-fns";

function formatDate(iso: string) {
  try {
    return format(new Date(iso), "MMM d, yyyy");
  } catch {
    return iso;
  }
}

export function BookingRow({ booking: b }: { booking: Booking }) {
  return (
    <Link href={`/bookings/${b.id}`}>
      <div className="bg-white rounded-xl border border-light-gray p-5 hover:shadow-md transition-shadow flex items-center gap-4">
        <div className="h-12 w-12 bg-off-white rounded-lg flex items-center justify-center shrink-0 border border-light-gray">
          <Car className="h-6 w-6 text-navy" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-navy">
              {b.carBrand && b.carModel
                ? `${b.carBrand} ${b.carModel}`
                : b.bookingReference}
            </p>
            <StatusBadge status={b.bookingStatus} />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {b.bookingReference}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(b.startDate)} → {formatDate(b.endDate)} ·{" "}
            {b.numberOfDays} day{b.numberOfDays !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className="font-bold text-navy">
            {new Intl.NumberFormat("en-KE", {
              style: "currency",
              currency: "KES",
            }).format(b.bookingCost ?? 0)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">View details →</p>
        </div>
      </div>
    </Link>
  );
}
