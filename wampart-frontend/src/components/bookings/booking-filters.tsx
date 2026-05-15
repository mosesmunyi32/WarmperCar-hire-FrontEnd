"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const BOOKING_TABS = [
  "PENDING",
  "CONFIRMED",
  "REJECTED",
  "COMPLETED",
  "CANCELLED",
] as const;

export type BookingTab = (typeof BOOKING_TABS)[number];

export function BookingFilters({
  tab,
  search,
  onTabChange,
  onSearchChange,
}: {
  tab: BookingTab;
  search: string;
  onTabChange: (t: BookingTab) => void;
  onSearchChange: (s: string) => void;
}) {
  return (
    <>
      <div className="flex gap-1 bg-white border border-light-gray rounded-lg p-1 mb-4 overflow-x-auto">
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

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by car or reference..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-10 bg-white"
        />
      </div>
    </>
  );
}
