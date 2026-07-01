"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Car, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Booking } from "@/types";

interface Trip {
  booking: Booking;
  car?: { brand: string; model: string; numberPlate: string };
}

function fmt(iso: string) {
  try {
    return format(new Date(iso), "MMM d, HH:mm");
  } catch {
    return iso;
  }
}

function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(Math.abs(ms) / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours || days) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  return parts.join(" ");
}

export function TripsOnRoad({
  trips,
  hrefBase,
}: {
  trips: Trip[];
  hrefBase: string;
}) {
  // Own ticking clock so only this card re-renders each second.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (trips.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-sm overflow-hidden mb-6">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-light-gray">
        <Car className="h-4 w-4 text-royal" />
        <h2 className="font-bold text-navy text-sm">Cars on Trip</h2>
        <span className="ml-1 inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-[11px] font-bold rounded-full bg-royal text-white">
          {trips.length}
        </span>
      </div>
      <div className="divide-y divide-light-gray max-h-96 overflow-y-auto">
        {trips.map(({ booking, car }) => {
          const start = new Date(booking.startDate).getTime();
          const end = new Date(booking.endDate).getTime();
          const total = Math.max(1, end - start);
          const pct = Math.min(100, Math.max(0, ((now - start) / total) * 100));
          const remaining = end - now;
          const overdue = remaining < 0;
          const carLabel = car
            ? `${car.brand} ${car.model} · ${car.numberPlate}`
            : `${booking.carBrand ?? ""} ${booking.carModel ?? ""}`.trim() ||
              booking.carNumberPlate ||
              booking.bookingReference;
          return (
            <Link
              key={booking.id}
              href={`${hrefBase}/${booking.id}`}
              className="block px-5 py-4 hover:bg-off-white transition-colors"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy truncate">
                    {carLabel}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {booking.bookingReference}
                  </p>
                </div>
                <div
                  className={`flex items-center gap-1.5 text-xs font-semibold shrink-0 ${
                    overdue ? "text-danger" : "text-navy"
                  }`}
                >
                  {overdue ? (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )}
                  {overdue
                    ? `Overdue by ${formatDuration(remaining)}`
                    : `${formatDuration(remaining)} left`}
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-light-gray overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    overdue
                      ? "bg-danger"
                      : pct > 80
                        ? "bg-warning"
                        : "bg-success"
                  }`}
                  style={{ width: `${overdue ? 100 : pct}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-[11px] text-muted-foreground">
                <span>Out: {fmt(booking.startDate)}</span>
                <span>Due: {fmt(booking.endDate)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
