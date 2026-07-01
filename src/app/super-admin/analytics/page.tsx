"use client";

import { useEffect, useMemo, useState } from "react";
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
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Users,
  Car,
  CalendarDays,
} from "lucide-react";
import { BarChart, DonutChart } from "@/components/charts";
import { bookingService } from "@/services/bookingServices";
import { carService } from "@/services/carServices";
import { customerServices } from "@/services/customerServices";
import { AdminBooking } from "@/types";

type Period = "calendar" | "week" | "month" | "year";

const BAR_COLOR = "#1E3A8A";

function countOn(bookings: AdminBooking[], date: Date) {
  return bookings.filter((b) => isSameDay(new Date(b.startDate), date)).length;
}

export default function SuperAdminAnalyticsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [carCount, setCarCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("month");
  const [cursor, setCursor] = useState(new Date());

  useEffect(() => {
    Promise.all([
      bookingService.getAllBookings(),
      customerServices.getAllCustomers(),
      carService.getAllCarsForAdmin(),
    ])
      .then(([b, cu, ca]) => {
        setBookings(b);
        setCustomerCount(cu.length);
        setCarCount(ca.length);
      })
      .finally(() => setLoading(false));
  }, []);

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
  const pendingCount = bookings.filter(
    (b) => b.bookingStatus === "PENDING",
  ).length;
  const confirmedCount = bookings.filter(
    (b) => b.bookingStatus === "CONFIRMED",
  ).length;
  const completedCount = bookings.filter(
    (b) => b.bookingStatus === "COMPLETED",
  ).length;
  const cancelledCount = bookings.filter(
    (b) => b.bookingStatus === "CANCELLED",
  ).length;

  const donutData = [
    { label: "Confirmed", value: confirmedCount, color: "#10B981" },
    { label: "Pending", value: pendingCount, color: "#F97316" },
    { label: "Completed", value: completedCount, color: "#3B82F6" },
    { label: "Cancelled", value: cancelledCount, color: "#EF4444" },
  ].filter((d) => d.value > 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">System Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Full platform performance overview
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
            value: loading ? "—" : `${carCount} cars`,
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
              {/* Period tabs */}
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
              {/* Navigation */}
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
            // Calendar grid
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

        {/* Booking status donut */}
        <div className="bg-white rounded-xl border border-light-gray p-5 shadow-sm">
          <h2 className="font-semibold text-navy text-sm mb-4">
            Booking Distribution
          </h2>
          {loading ? (
            <div className="h-40 bg-light-gray rounded-lg animate-pulse" />
          ) : donutData.length > 0 ? (
            <DonutChart data={donutData} />
          ) : (
            <p className="text-center text-muted-foreground text-sm py-8">
              No bookings yet.
            </p>
          )}

          {/* Status breakdown */}
          {!loading && (
            <div className="mt-4 space-y-2">
              {[
                {
                  label: "Confirmed",
                  value: confirmedCount,
                  color: "bg-success",
                },
                { label: "Pending", value: pendingCount, color: "bg-warning" },
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
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2 text-xs">
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
  );
}
