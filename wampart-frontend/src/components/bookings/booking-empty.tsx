import Link from "next/link";
import { Car, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BookingEmpty({
  hasBookings,
  message,
}: {
  hasBookings: boolean;
  message: string | null;
}) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <Car className="h-10 w-10 mx-auto mb-3 opacity-30" />
      <p className="font-medium">
        {hasBookings
          ? "No bookings match your filters"
          : (message ?? "No bookings yet")}
      </p>
      {!hasBookings && (
        <Link href="/cars" className="mt-3 inline-block">
          <Button size="sm" className="bg-navy hover:bg-royal gap-1.5">
            Browse Cars <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      )}
    </div>
  );
}
