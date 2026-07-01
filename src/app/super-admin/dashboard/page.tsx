"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Car,
  DollarSign,
  Shield,
  Activity,
  CalendarDays,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  Bell,
} from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { DonutChart } from "@/components/charts";
import { Button } from "@/components/ui/button";
import { superAdminService } from "@/services/superAdminService";
import { carService } from "@/services/carServices";
import { bookingService } from "@/services/bookingServices";
import { customerServices } from "@/services/customerServices";
import { AdminBooking, AdminCar, UserResponse } from "@/types";
import { format } from "date-fns";
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

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [admins, setAdmins] = useState<UserResponse[]>([]);
  const [cars, setCars] = useState<AdminCar[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [pendingVerifications, setPendingVerifications] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      superAdminService.getAllAdmins(),
      carService.getAllCarsForAdmin(),
      bookingService.getAllBookings(),
      customerServices.getAllCustomers(),
    ])
      .then(([adminList, carList, bookingList, customerList]) => {
        setAdmins(adminList);
        setCars(carList);
        setBookings(bookingList);
        setCustomerCount(customerList.length);
        setPendingVerifications(
          customerList.filter((u) => u.idFrontPhoto != null && u.idBackPhoto != null && !u.isVerified).length
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const carMap = new Map(cars.map((c) => [c.id, c]));

  const pending = bookings.filter((b) => b.bookingStatus === "PENDING").length;
  const confirmed = bookings.filter(
    (b) => b.bookingStatus === "CONFIRMED",
  ).length;
  const completed = bookings.filter(
    (b) => b.bookingStatus === "COMPLETED",
  ).length;
  const cancelled = bookings.filter(
    (b) => b.bookingStatus === "CANCELLED",
  ).length;

  const totalRevenue = bookings
    .filter((b) => b.bookingStatus === "COMPLETED")
    .reduce((sum, b) => sum + (b.bookingCost ?? 0), 0);

  const availableCars = cars.filter((c) => c.isAvailable).length;

  const recentBookings = [...bookings]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 6);

  const donutData = [
    { label: "Pending", value: pending, color: "#F97316" },
    { label: "Confirmed", value: confirmed, color: "#10B981" },
    { label: "Completed", value: completed, color: "#3B82F6" },
    { label: "Cancelled", value: cancelled, color: "#EF4444" },
  ].filter((d) => d.value > 0);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 bg-gold/10 rounded-xl flex items-center justify-center">
          <Activity className="h-5 w-5 text-gold" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-navy">
            {greeting()}, {user?.firstName ?? "Super Admin"}!
          </h1>
          <p className="text-muted-foreground text-sm">
            {new Date().toLocaleDateString("en-KE", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* KPI Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {loading ? (
          [0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              label="Total Admins"
              value={admins.length}
              sub="Active admin accounts"
              icon={Shield}
              color="text-royal"
              bg="bg-royal/10"
              href="/super-admin/admins"
            />
            <StatCard
              label="Total Customers"
              value={customerCount}
              sub="Registered users"
              icon={Users}
              color="text-azure"
              bg="bg-azure/10"
              href="/admin/customers"
            />
            <StatCard
              label="Total Cars"
              value={cars.length}
              sub="Fleet size"
              icon={Car}
              color="text-success"
              bg="bg-success/10"
              href="/admin/cars"
            />
            <StatCard
              label="Total Bookings"
              value={bookings.length}
              sub="All time"
              icon={CalendarDays}
              color="text-purple"
              bg="bg-purple/10"
              href="/admin/bookings"
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
              label="System Revenue"
              value={`KES ${totalRevenue.toLocaleString()}`}
              sub="From completed bookings"
              icon={DollarSign}
              color="text-gold"
              bg="bg-gold/10"
              href="/super-admin/analytics"
            />
            <StatCard
              label="Pending Approval"
              value={pending}
              sub="Awaiting review"
              icon={Clock}
              color="text-warning"
              bg="bg-warning/10"
              href="/admin/bookings"
            />
            <StatCard
              label="Available Cars"
              value={availableCars}
              sub="Ready to book"
              icon={Car}
              color="text-success"
              bg="bg-success/10"
              href="/admin/cars"
            />
            <StatCard
              label="Active Bookings"
              value={confirmed}
              sub="Ongoing now"
              icon={CheckCircle}
              color="text-azure"
              bg="bg-azure/10"
              href="/admin/bookings"
            />
          </>
        )}
      </div>

      {/* Alerts */}
      {!loading && (pending > 0 || pendingVerifications > 0) && (
        <div className="flex flex-col gap-3 mb-6">
          {pending > 0 && (
            <div className="relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-warning/35 bg-gradient-to-r from-warning/10 via-gold/[0.07] to-warning/10 px-5 py-4">
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-warning/70 to-transparent" />
              <div className="relative shrink-0">
                <div className="h-11 w-11 rounded-xl bg-warning/15 border border-warning/30 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-warning" />
                </div>
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-warning animate-ping opacity-75" />
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-navy text-[15px] leading-snug">
                  {pending} booking{pending !== 1 ? "s" : ""} pending review
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {pending !== 1 ? "These requests require" : "This request requires"} your attention — confirm or reject to keep the queue clear.
                </p>
              </div>
              <Link href="/admin/bookings" className="shrink-0">
                <Button className="bg-warning text-white hover:bg-warning/90 font-bold gap-2 shadow-md shadow-warning/20 whitespace-nowrap h-10">
                  Review Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
          {pendingVerifications > 0 && (
            <div className="relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-azure/30 bg-gradient-to-r from-azure/10 via-azure/[0.05] to-azure/10 px-5 py-4">
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-azure/60 to-transparent" />
              <div className="relative shrink-0">
                <div className="h-11 w-11 rounded-xl bg-azure/15 border border-azure/30 flex items-center justify-center">
                  <Users className="h-5 w-5 text-azure" />
                </div>
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-azure animate-ping opacity-75" />
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-azure" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-navy text-[15px] leading-snug">
                  {pendingVerifications} customer{pendingVerifications !== 1 ? "s" : ""} awaiting ID verification
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {pendingVerifications !== 1 ? "These customers have" : "This customer has"} submitted ID photos and {pendingVerifications !== 1 ? "are" : "is"} waiting to be verified.
                </p>
              </div>
              <Link href="/admin/customers" className="shrink-0">
                <Button className="bg-azure text-white hover:bg-azure/90 font-bold gap-2 shadow-md shadow-azure/20 whitespace-nowrap h-10">
                  Review Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent bookings */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-light-gray shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-light-gray">
            <h2 className="font-semibold text-navy">Recent Bookings</h2>
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
                  recentBookings.map((b) => {
                    const car = carMap.get(b.carId);
                    return (
                      <tr
                        key={b.id}
                        className="hover:bg-off-white transition-colors cursor-pointer"
                        onClick={() => router.push(`/admin/bookings/${b.id}`)}
                      >
                        <td className="px-4 py-3 font-mono text-xs text-navy">
                          {b.bookingReference}
                        </td>
                        <td className="px-4 py-3">
                          {car ? (
                            <div>
                              <p className="font-medium text-navy text-xs">
                                {car.brand} {car.model}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {car.numberPlate}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground font-mono">
                              {b.carId}
                            </span>
                          )}
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Booking status donut */}
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

          {/* Admin accounts summary */}
          <div className="bg-white rounded-xl border border-light-gray p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-navy text-sm">
                Admin Accounts
              </h2>
              <Link href="/super-admin/admins">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-azure gap-1 hover:text-azure/80 h-7 text-xs"
                >
                  Manage <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-9 bg-light-gray rounded animate-pulse"
                  />
                ))}
              </div>
            ) : admins.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-4">
                No admins yet.
              </p>
            ) : (
              <div className="space-y-2">
                {admins.slice(0, 4).map((a) => (
                  <div key={a.id} className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full bg-royal flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {a.firstName?.[0]}
                      {a.lastName?.[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-navy truncate">
                        {a.firstName} {a.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {a.email}
                      </p>
                    </div>
                    <span
                      className={`ml-auto text-xs font-medium px-1.5 py-0.5 rounded-full shrink-0 ${a.isActive ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}
                    >
                      {a.isActive ? "Active" : "Off"}
                    </span>
                  </div>
                ))}
                {admins.length > 4 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    +{admins.length - 4} more
                  </p>
                )}
              </div>
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
                  label: "Manage Admins",
                  href: "/super-admin/admins",
                  icon: Shield,
                },
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
                  label: "Unavailable Cars",
                  href: "/admin/cars",
                  icon: XCircle,
                },
              ].map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
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
