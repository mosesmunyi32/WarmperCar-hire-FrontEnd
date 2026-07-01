"use client";

import { useEffect, useState } from "react";
import { Navigation } from "lucide-react";
import { CustomerLayout } from "@/components/customer-layout";
import { bookingService } from "@/services/bookingServices";
import { Booking } from "@/types";
import { TripsOnRoad } from "@/components/admin/trips-on-road";

export default function CustomerTripsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingService
      .getMyBookings()
      .then(setBookings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const now = Date.now();
  const trips = bookings
    .filter(
      (b) =>
        b.bookingStatus === "CONFIRMED" &&
        new Date(b.startDate).getTime() <= now,
    )
    .map((b) => ({ booking: b }));

  return (
    <CustomerLayout breadcrumbs={[{ label: "My Trips" }]}>
      <div className="mx-auto max-w-3xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <Navigation className="h-6 w-6 text-royal" /> My Trips
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your ongoing hires with time remaining until return. Click a trip for
            full details.
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-light-gray h-24 animate-pulse"
              />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground bg-white rounded-2xl border border-light-gray">
            <Navigation className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">You have no active trips</p>
            <p className="text-sm mt-1">
              A trip appears here once your confirmed hire begins.
            </p>
          </div>
        ) : (
          <TripsOnRoad trips={trips} hrefBase="/bookings" />
        )}
      </div>
    </CustomerLayout>
  );
}
