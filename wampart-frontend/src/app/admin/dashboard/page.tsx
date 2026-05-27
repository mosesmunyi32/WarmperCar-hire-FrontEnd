"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Car,
  CalendarDays,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { DonutChart } from "@/components/charts";
import { Button } from "@/components/ui/button";
import { bookingService } from "@/services/bookingServices";
import { carService } from "@/services/carServices";
import { customerServices } from "@/services/customerServices";
import { AdminBooking, AdminCar } from "@/types";
import {
  format,
  differenceInDays,
  startOfDay,
  startOfWeek,
  startOfMonth,
} from "date-fns";
import useAuthStore from "@/store/authStore";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  bg,
  href,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  href?: string;
}) {
  const inner = (
    <div
      className={`bg-white rounded-xl border border-light-gray p-4 shadow-sm transition-all ${href ? "hover:shadow-md hover:border-navy/20 cursor-pointer" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-navy mt-1">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
        </div>
        <div className={`${bg} ${color} p-2.5 rounded-lg`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
  if (href)
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  return inner;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-light-gray p-4 shadow-sm animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-light-gray rounded" />
          <div className="h-7 w-12 bg-light-gray rounded" />
          <div className="h-3 w-16 bg-light-gray rounded" />
        </div>
        <div className="h-10 w-10 bg-light-gray rounded-lg" />
      </div>
    </div>
  );
}

type Period = "today" | "week" | "month" | "all";
const PERIODS: { label: string; value: Period }[] = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "All Time", value: "all" },
];

function periodStart(p: Period): Date | null {
  const now = new Date();
  if (p === "today") return startOfDay(now);
  if (p === "week") return startOfWeek(now, { weekStartsOn: 1 });
  if (p === "month") return startOfMonth(now);
  return null;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [cars, setCars] = useState<AdminCar[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [pendingVerifications, setPendingVerifications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("all");

  useEffect(() => {
    Promise.all([
      bookingService.getAllBookings(),
      carService.getAllCarsForAdmin(),
      customerServices.getAllCustomers(),
    ])
      .then(([b, c, cu]) => {
        setBookings(b);
        setCars(c);
        setCustomerCount(cu.length);
        setPendingVerifications(
          cu.filter(
            (u) =>
              u.idFrontPhoto != null && u.idBackPhoto != null && !u.isVerified,
          ).length,
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const cutoff = periodStart(period);
  const scopedBookings = cutoff
    ? bookings.filter((b) => new Date(b.createdAt) >= cutoff)
    : bookings;

  const pending = scopedBookings.filter(
    (b) => b.bookingStatus === "PENDING",
  ).length;
  const confirmed = scopedBookings.filter(
    (b) => b.bookingStatus === "CONFIRMED",
  ).length;
  const completed = scopedBookings.filter(
    (b) => b.bookingStatus === "COMPLETED",
  ).length;
  const cancelled = scopedBookings.filter(
    (b) => b.bookingStatus === "CANCELLED",
  ).length;

  const totalRevenue = scopedBookings
    .filter((b) => b.bookingStatus === "COMPLETED")
    .reduce((sum, b) => sum + (b.bookingCost ?? 0), 0);

  const availableCars = cars.filter((c) => c.isAvailable).length;
  const carMap = new Map(cars.map((c) => [c.id, c]));

  const insuranceAlerts = cars.filter((c) => {
    if (!c.insuranceExpiryDate) return false;
    const daysLeft = differenceInDays(
      new Date(c.insuranceExpiryDate),
      new Date(),
    );
    return daysLeft <= 30;
  }).length;

  const recentBookings = [...scopedBookings]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 10);

  const donutData = [
    { label: "Pending", value: pending, color: "#F97316" },
    { label: "Confirmed", value: confirmed, color: "#10B981" },
    { label: "Completed", value: completed, color: "#3B82F6" },
    { label: "Cancelled", value: cancelled, color: "#EF4444" },
  ].filter((d) => d.value > 0);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">
            {greeting()}, {user?.firstName ?? "Admin"}!
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {new Date().toLocaleDateString("en-KE", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-1 bg-white border border-light-gray rounded-lg p-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                period === p.value
                  ? "bg-navy text-white"
                  : "text-muted-foreground hover:text-navy"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {loading ? (
          [0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              label="Total Cars"
              value={cars.length}
              sub="Fleet size"
              icon={Car}
              color="text-royal"
              bg="bg-royal/10"
              href="/admin/cars"
            />
            <StatCard
              label="Total Bookings"
              value={bookings.length}
              sub="All time"
              icon={CalendarDays}
              color="text-azure"
              bg="bg-azure/10"
              href="/admin/bookings"
            />
            <StatCard
              label="Active Bookings"
              value={confirmed}
              sub="Ongoing now"
              icon={CheckCircle}
              color="text-success"
              bg="bg-success/10"
              href="/admin/bookings?tab=CONFIRMED"
            />
            <StatCard
              label="Total Customers"
              value={customerCount}
              sub="Registered users"
              icon={Users}
              color="text-purple"
              bg="bg-purple/10"
              href="/admin/customers"
            />
          </>
        )}
      </div>

      {/* KPI Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          [0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              label="Total Revenue"
              value={`KES ${totalRevenue.toLocaleString()}`}
              sub="From completed bookings"
              icon={CheckCircle}
              color="text-gold"
              bg="bg-gold/10"
              href="/admin/analytics"
            />
            <StatCard
              label="Pending Approval"
              value={pending}
              sub="Awaiting review"
              icon={Clock}
              color="text-warning"
              bg="bg-warning/10"
              href="/admin/bookings?tab=PENDING"
            />
            <StatCard
              label="Unavailable Cars"
              value={cars.length - availableCars}
              sub="Disabled / off-road"
              icon={XCircle}
              color="text-danger"
              bg="bg-danger/10"
              href="/admin/cars?filter=unavailable"
            />
            <StatCard
              label="Available Cars"
              value={availableCars}
              sub="Ready to book"
              icon={Car}
              color="text-success"
              bg="bg-success/10"
              href="/admin/cars?filter=available"
            />
          </>
        )}
      </div>

      {/* Alerts row */}
      {!loading &&
        (pending > 0 || insuranceAlerts > 0 || pendingVerifications > 0) && (
          <div className="flex flex-wrap gap-3 mb-6">
            {pending > 0 && (
              <Link
                href="/admin/bookings?tab=PENDING"
                className="relative flex items-center gap-2 bg-warning/10 border border-warning/30 text-warning text-sm font-medium rounded-xl px-4 py-2.5 hover:bg-warning/20 transition-colors shadow-sm"
              >
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-warning animate-ping opacity-75" />
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-warning" />
                <Clock className="h-4 w-4 shrink-0" />
                {pending} booking{pending !== 1 ? "s" : ""} awaiting approval
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            )}
            {insuranceAlerts > 0 && (
              <Link
                href="/admin/cars"
                className="relative flex items-center gap-2 bg-danger/10 border border-danger/30 text-danger text-sm font-medium rounded-xl px-4 py-2.5 hover:bg-danger/20 transition-colors shadow-sm"
              >
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-danger animate-ping opacity-75" />
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-danger" />
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {insuranceAlerts} car{insuranceAlerts !== 1 ? "s" : ""} with insurance expiring soon
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            )}
            {pendingVerifications > 0 && (
              <Link
                href="/admin/customers"
                className="relative flex items-center gap-2 bg-azure/10 border border-azure/30 text-azure text-sm font-medium rounded-xl px-4 py-2.5 hover:bg-azure/20 transition-colors shadow-sm"
              >
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-azure animate-ping opacity-75" />
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-azure" />
                <Users className="h-4 w-4 shrink-0" />
                {pendingVerifications} customer{pendingVerifications !== 1 ? "s" : ""} awaiting ID verification
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            )}
          </div>
        )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent bookings */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-light-gray shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-light-gray">
            <div>
              <h2 className="font-semibold text-navy">Recent Bookings</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {PERIODS.find((p) => p.value === period)?.label} ·{" "}
                {recentBookings.length} booking
                {recentBookings.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Link href="/admin/bookings">
              <Button
                variant="ghost"
                size="sm"
                className="text-azure gap-1 hover:text-azure/80 h-7 text-xs"
              >
                View All <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-light-gray bg-off-white">
                  {["Reference", "Car", "Dates", "Status", "Cost"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray">
                {loading ? (
                  [0, 1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="animate-pulse">
                      {[0, 1, 2, 3, 4].map((j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-3 bg-light-gray rounded w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : recentBookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-muted-foreground text-sm"
                    >
                      No bookings yet.
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((b) => (
                    <tr
                      key={b.id}
                      className="hover:bg-off-white transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/bookings/${b.id}`)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-navy">
                        {b.bookingReference}
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const car = carMap.get(b.carId);
                          if (!car)
                            return (
                              <span className="text-xs text-muted-foreground font-mono">
                                {b.carId}
                              </span>
                            );
                          return (
                            <div>
                              <p className="font-medium text-navy text-xs">
                                {car.brand} {car.model}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {car.numberPlate}
                              </p>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(b.startDate), "MMM d")} –{" "}
                        {format(new Date(b.endDate), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={b.bookingStatus} />
                      </td>
                      <td className="px-4 py-3 font-medium text-navy text-xs">
                        KES {(b.bookingCost ?? 0).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Booking status donut */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-light-gray p-5 shadow-sm">
            <h2 className="font-semibold text-navy text-sm mb-4">
              Booking Status
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
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-xl border border-light-gray p-5 shadow-sm">
            <h2 className="font-semibold text-navy text-sm mb-3">
              Quick Actions
            </h2>
            <div className="space-y-2">
              {[
                {
                  label: "Review Pending Bookings",
                  href: "/admin/bookings",
                  icon: Clock,
                },
                { label: "Manage Fleet", href: "/admin/cars", icon: Car },
                {
                  label: "View Customers",
                  href: "/admin/customers",
                  icon: Users,
                },
                {
                  label: "Reports",
                  href: "/admin/analytics",
                  icon: CalendarDays,
                },
              ].map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-off-white transition-colors group"
                >
                  <Icon className="h-4 w-4 text-royal shrink-0" />
                  <span className="text-sm text-navy group-hover:text-royal transition-colors">
                    {label}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 ml-auto text-muted-foreground group-hover:text-royal transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
