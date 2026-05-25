"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, XCircle } from "lucide-react";
import { CustomerLayout } from "@/components/customer-layout";
import { Button } from "@/components/ui/button";
import { BookingRow } from "@/components/bookings/booking-row";
import { BookingRowSkeleton } from "@/components/bookings/booking-row-skeleton";
import { BookingFilters, BookingTab, SortOption, BOOKING_TABS } from "@/components/bookings/booking-filters";
import { BookingEmpty } from "@/components/bookings/booking-empty";
import { bookingService } from "@/services/bookingServices";
import { Booking } from "@/types";

export default function MyBookingsPage() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status")?.toUpperCase() as BookingTab | null;
  const initialTab: BookingTab =
    statusParam && (BOOKING_TABS as readonly string[]).includes(statusParam)
      ? statusParam
      : "PENDING";
  const [tab, setTab] = useState<BookingTab>(initialTab);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
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

  const filtered = bookings
    .filter((b) => {
      if (b.bookingStatus !== tab) return false;
      const car = b.carBrand && b.carModel ? `${b.carBrand} ${b.carModel}` : "";
      if (!`${car} ${b.bookingReference}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (dateFrom && new Date(b.startDate) < new Date(dateFrom)) return false;
      if (dateTo && new Date(b.startDate) > new Date(dateTo)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "price-desc") return (b.bookingCost ?? 0) - (a.bookingCost ?? 0);
      if (sortBy === "price-asc") return (a.bookingCost ?? 0) - (b.bookingCost ?? 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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
          <div className="flex items-center gap-3">
            <Link href="/bookings/history" className="text-sm text-muted-foreground hover:text-navy flex items-center gap-1.5 transition-colors">
              Trip History <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="/cars">
              <Button className="bg-navy hover:bg-royal gap-2">
                Book a Car <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
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
          sortBy={sortBy}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onTabChange={setTab}
          onSearchChange={setSearch}
          onSortChange={setSortBy}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
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
