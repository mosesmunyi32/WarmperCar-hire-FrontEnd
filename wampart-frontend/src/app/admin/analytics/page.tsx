"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  addMonths,
  addWeeks,
  addYears,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CalendarDays,
  Car,
  Users,
} from "lucide-react";
import { BarChart, DonutChart } from "@/components/charts";
import { bookingService } from "@/services/bookingServices";
import { carService } from "@/services/carServices";
import { customerServices } from "@/services/customerServices";
import { AdminBooking, AdminCar } from "@/types";

type Period = "calendar" | "week" | "month" | "year";

const BAR_COLOR = "#1E3A8A";

function countOn(bookings: AdminBooking[], date: Date) {
  return bookings.filter((b) => isSameDay(new Date(b.startDate), date)).length;
}

export default function AnalyticsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [cars, setCars] = useState<AdminCar[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("month");
  const [cursor, setCursor] = useState(new Date());

  useEffect(() => {
    Promise.all([
      bookingService.getAllBookings(),
      carService.getAllCarsForAdmin(),
      customerServices.getAllCustomers(),
    ])
      .then(([b, ca, cu]) => {
        setBookings(b);
        setCars(ca);
        setCustomerCount(cu.length);
      })
      .finally(() => setLoading(false));
  }, []);

  const carMap = useMemo(() => new Map(cars.map((c) => [c.id, c])), [cars]);

  const goBack = () => {
    if (period === "week") setCursor((d) => subWeeks(d, 1));
    else if (period === "calendar" || period === "month")
      setCursor((d) => subMonths(d, 1));
    else setCursor((d) => subYears(d, 1));
  };
  const goForward = () => {
    if (period === "week") setCursor((d) => addWeeks(d, 1));
    else if (period === "calendar" || period === "month")
      setCursor((d) => addMonths(d, 1));
    else setCursor((d) => addYears(d, 1));
  };

  const periodLabel = useMemo(() => {
    if (period === "week") {
      const s = startOfWeek(cursor, { weekStartsOn: 1 });
      const e = endOfWeek(cursor, { weekStartsOn: 1 });
      return `${format(s, "MMM d")} – ${format(e, "MMM d, yyyy")}`;
    }
    if (period === "calendar" || period === "month")
      return format(cursor, "MMMM yyyy");
    return format(cursor, "yyyy");
  }, [period, cursor]);

  const chartData = useMemo(() => {
    if (period === "week") {
      const s = startOfWeek(cursor, { weekStartsOn: 1 });
      const e = endOfWeek(cursor, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: s, end: e }).map((day) => ({
        label: format(day, "EEE"),
        value: countOn(bookings, day),
        color: BAR_COLOR,
      }));
    }
    if (period === "month") {
      const s = startOfMonth(cursor);
      const e = endOfMonth(cursor);
      return eachDayOfInterval({ start: s, end: e }).map((day) => ({
        label: format(day, "d"),
        value: countOn(bookings, day),
        color: BAR_COLOR,
      }));
    }
    if (period === "year") {
      return Array.from({ length: 12 }, (_, i) => {
        const val = bookings.filter((b) => {
          const d = new Date(b.startDate);
          return d.getFullYear() === cursor.getFullYear() && d.getMonth() === i;
        }).length;
        return {
          label: format(new Date(cursor.getFullYear(), i, 1), "MMM"),
          value: val,
          color: BAR_COLOR,
        };
      });
    }
    return [];
  }, [period, cursor, bookings]);

  const calendarDays = useMemo(() => {
    if (period !== "calendar") return [];
    const s = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const e = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: s, end: e });
  }, [period, cursor]);

  const totalRevenue = bookings
    .filter((b) => b.bookingStatus === "COMPLETED")
    .reduce((sum, b) => sum + (b.bookingCost ?? 0), 0);

  const confirmedCount = bookings.filter(
    (b) => b.bookingStatus === "CONFIRMED",
  ).length;
  const pendingCount = bookings.filter(
    (b) => b.bookingStatus === "PENDING",
  ).length;
  const completedCount = bookings.filter(
    (b) => b.bookingStatus === "COMPLETED",
  ).length;
  const cancelledCount = bookings.filter(
    (b) => b.bookingStatus === "CANCELLED",
  ).length;
  const rejectedCount = bookings.filter(
    (b) => b.bookingStatus === "REJECTED",
  ).length;

  const donutData = [
    { label: "Confirmed", value: confirmedCount, color: "#10B981" },
    { label: "Pending", value: pendingCount, color: "#F97316" },
    { label: "Completed", value: completedCount, color: "#3B82F6" },
    { label: "Cancelled", value: cancelledCount, color: "#EF4444" },
    { label: "Rejected", value: rejectedCount, color: "#8B5CF6" },
  ].filter((d) => d.value > 0);

  // Most booked cars — count by carId
  const mostBooked = useMemo(() => {
    const counts = new Map<string, number>();
    bookings.forEach((b) =>
      counts.set(b.carId, (counts.get(b.carId) ?? 0) + 1),
    );
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([carId, count]) => {
        const car = carMap.get(carId);
        return {
          label: car ? `${car.brand} ${car.model}` : carId,
          value: count,
        };
      });
  }, [bookings, carMap]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">Analytics & Reports</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Business performance overview
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Revenue",
            value: loading ? "—" : `KES ${totalRevenue.toLocaleString()}`,
            icon: TrendingUp,
            color: "text-gold",
            bg: "bg-gold/10",
            href: null,
          },
          {
            label: "Total Bookings",
            value: loading ? "—" : bookings.length,
            icon: CalendarDays,
            color: "text-azure",
            bg: "bg-azure/10",
            href: "/admin/bookings",
          },
          {
            label: "Total Customers",
            value: loading ? "—" : customerCount,
            icon: Users,
            color: "text-purple",
            bg: "bg-purple/10",
            href: "/admin/customers",
          },
          {
            label: "Fleet Size",
            value: loading ? "—" : `${cars.length} cars`,
            icon: Car,
            color: "text-success",
            bg: "bg-success/10",
            href: "/admin/cars",
          },
        ].map((s) => {
          const inner = (
            <div
              className={`bg-white rounded-xl border border-light-gray p-4 shadow-sm transition-all ${s.href ? "hover:shadow-md hover:border-navy/20 cursor-pointer" : ""}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold text-navy mt-1">{s.value}</p>
                </div>
                <div className={`${s.bg} ${s.color} p-2.5 rounded-lg`}>
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
          return s.href ? (
            <Link key={s.label} href={s.href} className="block">
              {inner}
            </Link>
          ) : (
            <div key={s.label}>{inner}</div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        {/* Bookings over time */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-light-gray shadow-sm p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h2 className="font-semibold text-navy text-sm">
              Bookings Over Time
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5 bg-off-white border border-light-gray rounded-lg p-0.5">
                {(["calendar", "week", "month", "year"] as Period[]).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        period === p
                          ? "bg-navy text-white"
                          : "text-muted-foreground hover:text-navy"
                      }`}
                    >
                      {p === "calendar"
                        ? "Cal"
                        : p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ),
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={goBack}
                  className="h-7 w-7 flex items-center justify-center rounded-md border border-light-gray hover:bg-off-white transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5 text-navy" />
                </button>
                <span className="text-xs font-medium text-navy min-w-36 text-center">
                  {periodLabel}
                </span>
                <button
                  onClick={goForward}
                  className="h-7 w-7 flex items-center justify-center rounded-md border border-light-gray hover:bg-off-white transition-colors"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-navy" />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="h-52 bg-light-gray rounded-lg animate-pulse" />
          ) : period === "calendar" ? (
            <div>
              <div className="grid grid-cols-7 mb-1">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div
                    key={d}
                    className="text-center text-xs font-medium text-muted-foreground py-2"
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day) => {
                  const count = countOn(bookings, day);
                  const inMonth = isSameMonth(day, cursor);
                  const isToday = isSameDay(day, new Date());
                  return (
                    <div
                      key={day.toISOString()}
                      className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-colors
                        ${!inMonth ? "opacity-25" : count > 0 ? "bg-navy/10" : "hover:bg-off-white"}
                        ${isToday ? "ring-2 ring-navy ring-offset-1" : ""}`}
                    >
                      <span
                        className={`font-medium ${inMonth ? "text-navy" : "text-muted-foreground"}`}
                      >
                        {format(day, "d")}
                      </span>
                      {count > 0 && inMonth && (
                        <span className="mt-0.5 text-[10px] font-bold text-royal">
                          {count}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <BarChart data={chartData} height={220} />
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Booking status donut */}
          <div className="bg-white rounded-xl border border-light-gray p-5 shadow-sm">
            <h2 className="font-semibold text-navy text-sm mb-4">
              Booking Status
            </h2>
            {loading ? (
              <div className="h-36 bg-light-gray rounded-lg animate-pulse" />
            ) : donutData.length > 0 ? (
              <DonutChart data={donutData} />
            ) : (
              <p className="text-center text-muted-foreground text-sm py-6">
                No bookings yet.
              </p>
            )}
            {!loading && (
              <div className="mt-3 space-y-1.5">
                {[
                  {
                    label: "Confirmed",
                    value: confirmedCount,
                    color: "bg-success",
                  },
                  {
                    label: "Pending",
                    value: pendingCount,
                    color: "bg-warning",
                  },
                  {
                    label: "Completed",
                    value: completedCount,
                    color: "bg-azure",
                  },
                  {
                    label: "Cancelled",
                    value: cancelledCount,
                    color: "bg-danger",
                  },
                  {
                    label: "Rejected",
                    value: rejectedCount,
                    color: "bg-purple",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${s.color}`}
                    />
                    <span className="text-muted-foreground flex-1">
                      {s.label}
                    </span>
                    <span className="font-medium text-navy">{s.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Most booked cars */}
      {!loading && mostBooked.length > 0 && (
        <div className="bg-white rounded-xl border border-light-gray shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-light-gray">
            <h2 className="font-semibold text-navy text-sm">
              Most Booked Cars
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {mostBooked.map((car, i) => {
              const max = mostBooked[0].value || 1;
              return (
                <div key={car.label} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-royal w-4 shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm text-navy flex-1 min-w-0 truncate">
                    {car.label}
                  </span>
                  <div className="w-32 h-1.5 bg-light-gray rounded-full overflow-hidden">
                    <div
                      className="h-full bg-navy rounded-full"
                      style={{ width: `${(car.value / max) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-navy w-8 text-right">
                    {car.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
