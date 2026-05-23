"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Car,
  Clock,
  ArrowRight,
  Search,
  User,
  FileText,
  XCircle,
  ShieldAlert,
  ShieldCheck,
  Clock3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { CustomerLayout } from "@/components/customer-layout";
import useAuthStore from "@/store/authStore";
import { bookingService } from "@/services/bookingServices";
import { profileService } from "@/services/profileService";
import { Booking } from "@/types";
import { format } from "date-fns";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function formatDate(iso: string) {
  try {
    return format(new Date(iso), "MMM d, yyyy");
  } catch {
    return iso;
  }
}

function StatSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-light-gray p-5 shadow-sm animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-light-gray rounded" />
          <div className="h-8 w-12 bg-light-gray rounded" />
          <div className="h-3 w-16 bg-light-gray rounded" />
        </div>
        <div className="h-11 w-11 bg-light-gray rounded-lg" />
      </div>
    </div>
  );
}

function BookingRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 animate-pulse">
      <div className="h-10 w-10 bg-light-gray rounded-lg shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-32 bg-light-gray rounded" />
        <div className="h-3 w-44 bg-light-gray rounded" />
        <div className="h-3 w-36 bg-light-gray rounded" />
      </div>
      <div className="text-right space-y-1.5">
        <div className="h-5 w-20 bg-light-gray rounded-full" />
        <div className="h-3.5 w-24 bg-light-gray rounded" />
      </div>
    </div>
  );
}

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("");
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  useEffect(() => {
    if (user?.id) {
      profileService.getMyProfile(user.id).then(setUser).catch(() => {})
    }
  }, []);

  const STATIC_ACTIONS = [
    { label: "Browse Cars", href: "/cars", icon: Search, color: "bg-royal" },
    { label: "My Bookings", href: "/bookings", icon: CalendarDays, color: "bg-azure" },
  ];

  const PROFILE_ACTIONS = [
    { label: "My Profile", icon: User, color: "bg-navy" },
    { label: "Documents", icon: FileText, color: "bg-gold" },
  ];

  useEffect(() => {
    bookingService
      .getMyBookings()
      .then(setBookings)
      .catch(() => setError("Failed to load bookings. Please refresh."))
      .finally(() => setLoading(false));
  }, []);

  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(
    (b) => b.bookingStatus === "CONFIRMED",
  ).length;
  const pendingBookings = bookings.filter(
    (b) => b.bookingStatus === "PENDING",
  ).length;

  const recentBookings = [...bookings]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const stats = [
    {
      label: "Total Bookings",
      value: totalBookings,
      sub: "All time",
      icon: CalendarDays,
      color: "text-royal",
      bg: "bg-royal/10",
    },
    {
      label: "Active Bookings",
      value: activeBookings,
      sub: "In progress",
      icon: Car,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Pending Approval",
      value: pendingBookings,
      sub: "Awaiting confirmation",
      icon: Clock,
      color: "text-warning",
      bg: "bg-warning/10",
    },
  ];

  return (
    <CustomerLayout breadcrumbs={[{ label: "Dashboard" }]}>
      <div className="flex flex-col gap-6 p-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-navy">
            {greeting}, {user?.firstName ?? "there"}!
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here is your account overview
          </p>
        </div>

        {/* ── Verification banner ── */}
        {user?.isVerified ? (
          /* Verified */
          <div className="flex items-center gap-4 rounded-2xl border border-success/30 bg-success/[0.07] px-5 py-4">
            <div className="h-10 w-10 rounded-xl bg-success/15 border border-success/25 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-success text-[15px] leading-snug">
                Identity verified — you&apos;re all set!
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                You can hire any car in our fleet anytime. Enjoy the ride!
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-success bg-success/10 border border-success/20 px-3 py-1.5 rounded-full shrink-0">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified
            </span>
          </div>
        ) : user?.idFrontPhoto && user?.idBackPhoto ? (
          /* Photos uploaded, awaiting admin verification */
          <div className="relative overflow-hidden rounded-2xl border border-azure/30 bg-gradient-to-r from-azure/[0.07] via-royal/[0.05] to-azure/[0.07] px-5 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative shrink-0">
                <div className="h-10 w-10 rounded-xl bg-azure/15 border border-azure/25 flex items-center justify-center">
                  <Clock3 className="h-5 w-5 text-azure" />
                </div>
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-azure animate-ping opacity-60" />
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-azure" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-navy text-[15px] leading-snug">
                  Awaiting verification
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Your ID photos have been received. Our team will verify your account shortly — usually within 24 hours.
                </p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-azure bg-azure/10 border border-azure/20 px-3 py-1.5 rounded-full shrink-0">
                <Clock3 className="h-3.5 w-3.5" /> Under Review
              </span>
            </div>
          </div>
        ) : (
          /* No photos uploaded yet */
          <div className="relative overflow-hidden rounded-2xl border border-gold/35 bg-gradient-to-r from-gold/10 via-warning/[0.07] to-gold/10 p-5">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative shrink-0">
                <div className="h-12 w-12 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center">
                  <ShieldAlert className="h-6 w-6 text-gold" />
                </div>
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-warning animate-ping opacity-75" />
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-navy text-[15px] leading-snug">
                  Your account is not yet verified
                </p>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {"Upload your "}
                  <strong className="text-navy font-semibold">National ID photos</strong>
                  {" (front & back) to confirm bookings and unlock full access. It only takes a minute."}
                </p>
              </div>
              <Link href={`/profile/${user?.id}`} className="shrink-0">
                <Button className="bg-gold text-navy hover:bg-gold/90 font-bold gap-2 shadow-lg shadow-gold/20 whitespace-nowrap h-10">
                  Upload ID Photos <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3">
            <XCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {loading
            ? [0, 1, 2].map((i) => <StatSkeleton key={i} />)
            : stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-xl border border-light-gray p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold text-navy mt-1">
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.sub}
                      </p>
                    </div>
                    <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-light-gray shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-light-gray">
              <h2 className="font-semibold text-navy">Recent Bookings</h2>
              <Link
                href="/bookings"
                className="text-xs text-azure hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-light-gray">
              {loading ? (
                [0, 1, 2].map((i) => <BookingRowSkeleton key={i} />)
              ) : recentBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Car className="h-10 w-10 mb-3 opacity-20" />
                  <p className="font-medium text-sm">No bookings yet</p>
                  <Link href="/cars" className="mt-3">
                    <Button
                      size="sm"
                      className="bg-navy hover:bg-royal gap-1.5 h-8 text-xs"
                    >
                      Browse Cars <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              ) : (
                recentBookings.map((b) => (
                  <Link
                    key={b.id}
                    href={`/bookings/${b.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-off-white transition-colors"
                  >
                    <div className="h-10 w-10 bg-navy/5 rounded-lg flex items-center justify-center shrink-0">
                      <Car className="h-5 w-5 text-navy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-navy text-sm truncate">
                        {b.carBrand && b.carModel
                          ? `${b.carBrand} ${b.carModel}`
                          : b.bookingReference}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {b.bookingReference}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(b.startDate)} – {formatDate(b.endDate)} ·{" "}
                        {b.numberOfDays} day{b.numberOfDays !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <StatusBadge status={b.bookingStatus} />
                      <p className="text-sm font-semibold text-navy mt-1">
                        KES {(b.bookingCost ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-light-gray shadow-sm">
            <div className="px-5 py-4 border-b border-light-gray">
              <h2 className="font-semibold text-navy">Quick Actions</h2>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {STATIC_ACTIONS.map(({ label, href, icon: Icon, color }) => (
                <Link key={label} href={href}>
                  <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-light-gray hover:border-royal/30 hover:shadow-sm transition-all cursor-pointer group">
                    <div className={`${color} text-white h-10 w-10 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium text-navy text-center leading-tight">{label}</span>
                  </div>
                </Link>
              ))}
              {PROFILE_ACTIONS.map(({ label, icon: Icon, color }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => user?.id && router.push(`/profile/${user.id}`)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-light-gray hover:border-royal/30 hover:shadow-sm transition-all cursor-pointer group text-left"
                >
                  <div className={`${color} text-white h-10 w-10 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-navy text-center leading-tight">{label}</span>
                </button>
              ))}
            </div>
            <div className="px-5 pb-5">
              <Link href="/cars">
                <Button className="w-full bg-navy hover:bg-royal gap-2 h-10">
                  Book a Car <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
