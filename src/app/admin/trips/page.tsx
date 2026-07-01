"use client";

import { useEffect, useState } from "react";
import { Navigation } from "lucide-react";
import { bookingService } from "@/services/bookingServices";
import { carService } from "@/services/carServices";
import { AdminBooking, AdminCar } from "@/types";
import { TripsOnRoad } from "@/components/admin/trips-on-road";

export default function AdminTripsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [cars, setCars] = useState<AdminCar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      bookingService.getAllBookings(),
      carService.getAllCarsForAdmin(),
    ])
      .then(([b, c]) => {
        setBookings(b);
        setCars(c);
      })
      .finally(() => setLoading(false));
  }, []);

  const carMap = new Map(cars.map((c) => [c.id, c]));
  const trips = bookings
    .filter(
      (b) =>
        b.bookingStatus === "CONFIRMED" &&
        b.mileageStart != null &&
        b.mileageEnd == null,
    )
    .map((b) => ({ booking: b, car: carMap.get(b.carId) }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
          <Navigation className="h-6 w-6 text-royal" /> Current Trips
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Cars currently on the road, with time remaining until return. Click a
          trip to see full details.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-light-gray h-24 animate-pulse"
            />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground bg-white rounded-2xl border border-light-gray">
          <Navigation className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No cars are on a trip right now</p>
          <p className="text-sm mt-1">
            Active trips appear here once a car is handed over.
          </p>
        </div>
      ) : (
        <TripsOnRoad trips={trips} hrefBase="/admin/bookings" />
      )}
    </div>
  );
}
