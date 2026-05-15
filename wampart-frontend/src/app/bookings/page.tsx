"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, XCircle } from "lucide-react";
import { CustomerLayout } from "@/components/customer-layout";
import { Button } from "@/components/ui/button";
import { BookingRow } from "@/components/bookings/booking-row";
import { BookingRowSkeleton } from "@/components/bookings/booking-row-skeleton";
import { BookingFilters, BookingTab } from "@/components/bookings/booking-filters";
import { BookingEmpty } from "@/components/bookings/booking-empty";
import { bookingService } from "@/services/bookingServices";
import { Booking } from "@/types";

export default function MyBookingsPage() {
  const [tab, setTab] = useState<BookingTab>("PENDING");
  const [search, setSearch] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bookingService
      .getMyBookings()
      .then((data) => {
        if (typeof data === "string") {
          setEmptyMessage(data);
          setBookings([]);
        } else if (Array.isArray(data)) {
          setBookings(data);
        } else {
          setBookings([data]);
        }
      })
      .catch(() => setError("Failed to load bookings. Please refresh."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter((b) => {
    const matchTab = b.bookingStatus === tab;
    const car = b.carBrand && b.carModel ? `${b.carBrand} ${b.carModel}` : "";
    const matchSearch = `${car} ${b.bookingReference}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <CustomerLayout breadcrumbs={[{ label: "My Bookings" }]}>
      <div className="mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-navy">My Bookings</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {loading
                ? "Loading..."
                : `${bookings.length} total booking${bookings.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Link href="/cars">
            <Button className="bg-navy hover:bg-royal gap-2">
              Book a Car <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3 mb-4">
            <XCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Filters */}
        <BookingFilters
          tab={tab}
          search={search}
          onTabChange={setTab}
          onSearchChange={setSearch}
        />

        {/* List */}
        <div className="space-y-3">
          {loading ? (
            [0, 1, 2, 3].map((i) => <BookingRowSkeleton key={i} />)
          ) : filtered.length === 0 ? (
            <BookingEmpty
              hasBookings={bookings.length > 0}
              message={emptyMessage}
            />
          ) : (
            filtered.map((b) => <BookingRow key={b.id} booking={b} />)
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
