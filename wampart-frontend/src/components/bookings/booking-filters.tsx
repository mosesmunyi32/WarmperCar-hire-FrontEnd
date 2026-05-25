"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export const BOOKING_TABS = [
  "PENDING",
  "CONFIRMED",
  "REJECTED",
  "COMPLETED",
  "CANCELLED",
] as const;

export type BookingTab = (typeof BOOKING_TABS)[number];
export type SortOption = "newest" | "oldest" | "price-desc" | "price-asc";

export function BookingFilters({
  tab,
  search,
  sortBy,
  dateFrom,
  dateTo,
  onTabChange,
  onSearchChange,
  onSortChange,
  onDateFromChange,
  onDateToChange,
}: {
  tab: BookingTab;
  search: string;
  sortBy: SortOption;
  dateFrom: string;
  dateTo: string;
  onTabChange: (t: BookingTab) => void;
  onSearchChange: (s: string) => void;
  onSortChange: (s: SortOption) => void;
  onDateFromChange: (d: string) => void;
  onDateToChange: (d: string) => void;
}) {
  const hasFilters = search || dateFrom || dateTo || sortBy !== "newest";

  return (
    <>
      {/* Status tabs */}
      <div className="flex gap-1 bg-white border border-light-gray rounded-lg p-1 mb-3 overflow-x-auto">
        {BOOKING_TABS.map((t) => (
          <button
            key={t}
            onClick={() => onTabChange(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t
                ? "bg-navy text-white"
                : "text-muted-foreground hover:text-navy"
            }`}
          >
            {t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Search + sort + date row */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <div className="relative flex-1 min-w-44">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by car or reference..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="h-9 rounded-lg border border-input bg-white px-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="price-asc">Price: Low → High</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Start date:</span>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="h-9 w-36 bg-white text-sm"
          />
          <span className="text-muted-foreground text-xs">—</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="h-9 w-36 bg-white text-sm"
          />
        </div>

        {hasFilters && (
          <button
            onClick={() => {
              onSearchChange("");
              onSortChange("newest");
              onDateFromChange("");
              onDateToChange("");
            }}
            className="flex items-center gap-1 text-xs text-danger hover:text-danger/80 transition-colors"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>
    </>
  );
}
