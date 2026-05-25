"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Images, Trash2, AlertTriangle, Pencil, Save, X, CalendarDays, User, Clock, CheckCircle2, List, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isSameDay,
  isWithinInterval,
  parseISO,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { carService } from "@/services/carServices";
import { bookingService } from "@/services/bookingServices";
import { AdminBooking, AdminCar, BookingHistoryResponse } from "@/types";
import { CarBasicInfoCard } from "@/components/admin/cars/car-basic-info-card";
import { CarAdminDetailsCard } from "@/components/admin/cars/car-admin-details-card";
import { CarImagesCard } from "@/components/admin/cars/car-images-card";
import { StatusBadge } from "@/components/status-badge";
import useAuthStore from "@/store/authStore";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type FuelType = "PETROL" | "DIESEL" | "ELECTRIC" | "HYBRID";
type Transmission = "AUTOMATIC" | "MANUAL";

type CarForm = {
  brand: string;
  model: string;
  yearOfManufacture: string;
  color: string;
  fuelType: FuelType | "";
  transmission: Transmission | "";
  numberOfPassengers: string;
  numberPlate: string;
  description: string;
  pricePerDay: string;
  currentMileage: string;
  serviceMileageInterval: string;
  insuranceExpirationDate: string;
  isAvailable: boolean;
};

const EMPTY_FORM: CarForm = {
  brand: "",
  model: "",
  yearOfManufacture: "",
  color: "",
  fuelType: "",
  transmission: "",
  numberOfPassengers: "",
  numberPlate: "",
  description: "",
  pricePerDay: "",
  currentMileage: "",
  serviceMileageInterval: "",
  insuranceExpirationDate: "",
  isAvailable: true,
};

function carToForm(c: AdminCar): CarForm {
  return {
    brand: c.brand,
    model: c.model,
    yearOfManufacture: c.yearOfManufacture.toString(),
    color: c.color,
    fuelType: (c.typeOfFuel?.toUpperCase() as FuelType) ?? "",
    transmission: (c.transmission?.toUpperCase() as Transmission) ?? "",
    numberOfPassengers: c.numberOfPassengers?.toString() ?? "",
    numberPlate: c.numberPlate,
    description: c.description,
    pricePerDay: c.pricePerDay.toString(),
    currentMileage: c.currentMileage.toString(),
    serviceMileageInterval: c.serviceMileageInterval.toString(),
    insuranceExpirationDate: c.insuranceExpiryDate?.split("T")[0] ?? "",
    isAvailable: c.isAvailable,
  };
}

function PageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 bg-light-gray rounded w-32 animate-pulse" />
      <div className="grid lg:grid-cols-2 gap-5">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-light-gray p-5 animate-pulse h-80"
          />
        ))}
      </div>
    </div>
  );
}

export default function EditCarPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const [car, setCar] = useState<AdminCar | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const [form, setForm] = useState<CarForm>(EMPTY_FORM);
  const [tab, setTab] = useState<"details" | "photos" | "bookings">("details");
  const [carBookings, setCarBookings] = useState<BookingHistoryResponse[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [refToId, setRefToId] = useState<Map<string, string>>(new Map());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [togglingAvailability, setTogglingAvailability] = useState(false);
  const [damageResolved, setDamageResolved] = useState(() => {
    try { return localStorage.getItem(`damage_resolved_${id}`) === "true"; } catch { return false; }
  });

  useEffect(() => {
    Promise.allSettled([
      carService.getAdminCarById(id).then((c) => { setCar(c); setForm(carToForm(c)); }),
      bookingService.getCarBookingHistory(id).then(setCarBookings),
      bookingService.getAllBookings()
        .then((all: AdminBooking[]) => {
          const map = new Map<string, string>();
          all.filter((b) => b.carId === id).forEach((b) => map.set(b.bookingReference, b.id));
          setRefToId(map);
        })
        .catch(() => {}),
    ]).finally(() => { setLoading(false); setBookingsLoading(false); });
  }, [id]);

  const hasDamageRecord = carBookings.some((b) => b.carWasDamaged) && !damageResolved;

  const handleResolveDamage = () => {
    try { localStorage.setItem(`damage_resolved_${id}`, "true"); } catch {}
    setDamageResolved(true);
  };

  const handleTabChange = (next: "details" | "photos" | "bookings") => {
    setTab(next);
  };

  const handleToggleAvailability = async () => {
    setTogglingAvailability(true);
    try {
      const result = await carService.toggleAvailability(id);
      setCar((prev) => prev ? { ...prev, isAvailable: result.available } : prev);
      toast.success(result.available ? "Car marked as available for booking." : "Car marked as unavailable.");
    } catch {
      toast.error("Failed to update availability.");
    } finally {
      setTogglingAvailability(false);
    }
  };

  const setField = (key: keyof CarForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleCancelEdit = () => {
    if (car) setForm(carToForm(car));
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await carService.updateCar(id, {
        brand: form.brand,
        model: form.model,
        yearOfManufacture: Number(form.yearOfManufacture),
        color: form.color,
        typeOfFuel: form.fuelType,
        transmission: form.transmission,
        numberOfPassengers: Number(form.numberOfPassengers),
        numberPlate: form.numberPlate,
        description: form.description,
        pricePerDay: Number(form.pricePerDay),
        currentMileage: Number(form.currentMileage),
        serviceMileageInterval: Number(form.serviceMileageInterval),
        insuranceExpiryDate: `${form.insuranceExpirationDate}T00:00:00`,
        isAvailable: true,
      });
      setCar(updated);
      setIsEditing(false);
      toast.success("Car details saved.");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg ?? "Failed to save car.");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImages = async (files: FileList) => {
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("files", f));
      const updated = await carService.uploadCarImages(id, fd);
      setCar(updated);
      toast.success(
        `${files.length} image${files.length > 1 ? "s" : ""} uploaded.`,
      );
    } catch {
      toast.error("Failed to upload images.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (url: string) => {
    setDeletingUrl(url);
    try {
      await carService.deleteCarImage(id, url);
      setCar((prev) =>
        prev
          ? {
              ...prev,
              images: (prev.images ?? []).filter((img) => img !== url),
            }
          : prev,
      );
    } catch {
      toast.error("Failed to delete image.");
    } finally {
      setDeletingUrl(null);
    }
  };

  const handleDeleteCar = async () => {
    setDeleting(true);
    try {
      await carService.deleteCar(id);
      toast.success(`${car?.brand} ${car?.model} deleted successfully.`);
      router.push("/admin/cars");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg ?? "Failed to delete car.");
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) return <PageSkeleton />;

  if (!car) {
    return (
      <div>
        <Link
          href="/admin/cars"
          className="flex items-center gap-2 text-muted-foreground hover:text-navy text-sm mb-6 w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Cars
        </Link>
        <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3">
          Car not found.
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/cars"
        className="flex items-center gap-2 text-muted-foreground hover:text-navy text-sm mb-6 w-fit"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Cars
      </Link>

      {/* Header + tab switcher */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h1 className="text-2xl font-bold text-navy">
              {car.brand} {car.model}
            </h1>
            {hasDamageRecord && (
              <span className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1.5 text-xs font-semibold bg-danger/10 text-danger border border-danger/20 px-2.5 py-1 rounded-full">
                  <AlertTriangle className="h-3.5 w-3.5" /> Damage on Record
                </span>
                <button
                  type="button"
                  onClick={handleResolveDamage}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-success border border-light-gray hover:border-success/40 hover:bg-success/5 px-2.5 py-1 rounded-full transition-all"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Mark Resolved
                </button>
              </span>
            )}
            {!car.isAvailable && (
              <span className="text-xs font-semibold bg-muted text-muted-foreground border border-light-gray px-2.5 py-1 rounded-full">
                Unavailable
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            {car.numberPlate} · {car.color} · {car.yearOfManufacture}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {!car.isAvailable && (
            <Button
              size="sm"
              onClick={handleToggleAvailability}
              disabled={togglingAvailability}
              className="bg-success hover:bg-success/90 text-white gap-1.5 h-8 text-xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {togglingAvailability ? "Updating…" : "Mark as Available"}
            </Button>
          )}
          {/* Edit / Save toggle — Details tab only */}
          {tab === "details" && (
            isEditing ? (
              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  form="car-details-form"
                  size="sm"
                  disabled={saving}
                  className="bg-navy hover:bg-royal gap-1.5 h-8 text-xs"
                >
                  <Save className="h-3.5 w-3.5" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={saving}
                  onClick={handleCancelEdit}
                  className="h-8 text-xs gap-1.5"
                >
                  <X className="h-3.5 w-3.5" /> Cancel
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="border-navy/30 text-navy hover:bg-navy/5 gap-1.5 h-8 text-xs"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit Details
              </Button>
            )
          )}

          {/* Delete — super-admin only */}
          {isSuperAdmin && (
            <div className="flex items-center gap-2">
              {confirmDelete ? (
                <>
                  <div className="flex items-center gap-1.5 text-xs text-danger font-medium">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Permanently delete this car?
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    disabled={deleting}
                    onClick={handleDeleteCar}
                    className="bg-danger hover:bg-danger/90 text-white gap-1.5 h-8 text-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {deleting ? "Deleting..." : "Yes, Delete"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={deleting}
                    onClick={() => setConfirmDelete(false)}
                    className="h-8 text-xs"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDelete(true)}
                  className="border-danger/30 text-danger hover:bg-danger/5 gap-1.5 h-8 text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete Car
                </Button>
              )}
            </div>
          )}
          <div className="flex gap-1 bg-white border border-light-gray rounded-lg p-1">
            <button
              type="button"
              onClick={() => handleTabChange("details")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === "details" ? "bg-navy text-white" : "text-muted-foreground hover:text-navy"
              }`}
            >
              Car Details
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("photos")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === "photos" ? "bg-navy text-white" : "text-muted-foreground hover:text-navy"
              }`}
            >
              <Images className="h-3.5 w-3.5" /> Photos
              {(car.images?.length ?? 0) > 0 && (
                <span className={`text-xs rounded-full px-1.5 ${tab === "photos" ? "bg-white/20" : "bg-navy/10"}`}>
                  {car.images!.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("bookings")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === "bookings" ? "bg-navy text-white" : "text-muted-foreground hover:text-navy"
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" /> Bookings
            </button>
          </div>
        </div>
      </div>

      {tab === "details" && (
        <form id="car-details-form" onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-2 gap-5">
            <CarBasicInfoCard form={form} onChange={setField} disabled={!isEditing} />
            <CarAdminDetailsCard form={form} onChange={setField} disabled={!isEditing} />
          </div>
        </form>
      )}

      {tab === "photos" && (
        <CarImagesCard
          images={car.images ?? []}
          uploading={uploading}
          deletingUrl={deletingUrl}
          onUpload={handleUploadImages}
          onDelete={handleDeleteImage}
        />
      )}

      {tab === "bookings" && (
        <CarBookingsTab bookings={carBookings} loading={bookingsLoading} carId={id} refToId={refToId} />
      )}
    </div>
  );
}

type BookingDayStatus = "active" | "upcoming-confirmed" | "upcoming-pending" | "completed" | "cancelled";

function getDayBookingStatus(date: Date, bookings: BookingHistoryResponse[], today: Date): BookingDayStatus | null {
  const priority: BookingDayStatus[] = ["active", "upcoming-confirmed", "upcoming-pending", "completed", "cancelled"];
  let best: BookingDayStatus | null = null;

  for (const b of bookings) {
    let start: Date, end: Date;
    try {
      start = parseISO(b.startDate);
      end = parseISO(b.endDate);
    } catch {
      continue;
    }
    if (!isWithinInterval(date, { start, end })) continue;

    let status: BookingDayStatus;
    if (b.bookingStatus === "CONFIRMED" && start <= today && end >= today) {
      status = "active";
    } else if (b.bookingStatus === "CONFIRMED" && start > today) {
      status = "upcoming-confirmed";
    } else if (b.bookingStatus === "PENDING") {
      status = "upcoming-pending";
    } else if (b.bookingStatus === "COMPLETED") {
      status = "completed";
    } else {
      status = "cancelled";
    }

    if (best === null || priority.indexOf(status) < priority.indexOf(best)) {
      best = status;
    }
    if (best === "active") break;
  }
  return best;
}

function CarBookingsCalendar({ bookings, refToId }: { bookings: BookingHistoryResponse[]; refToId: Map<string, string> }) {
  const router = useRouter();
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = (getDay(monthStart) + 6) % 7;

  const dayStatusClass: Record<BookingDayStatus, string> = {
    "active": "bg-success text-white font-semibold",
    "upcoming-confirmed": "bg-royal text-white font-semibold",
    "upcoming-pending": "bg-gold text-navy font-semibold",
    "completed": "bg-navy/15 text-navy",
    "cancelled": "bg-danger/15 text-danger",
  };

  const selectedDayBookings = selectedDay
    ? bookings.filter((b) => {
        try {
          return isWithinInterval(selectedDay, { start: parseISO(b.startDate), end: parseISO(b.endDate) });
        } catch { return false; }
      })
    : [];

  const monthBookings = bookings.filter((b) => {
    try {
      const s = parseISO(b.startDate);
      const e = parseISO(b.endDate);
      return s <= monthEnd && e >= monthStart;
    } catch { return false; }
  });
  const monthRevenue = monthBookings
    .filter((b) => b.bookingStatus === "COMPLETED")
    .reduce((sum, b) => sum + (b.bookingCost ?? 0), 0);

  return (
    <div className="space-y-4">
      {/* Monthly summary row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-light-gray px-4 py-3">
          <p className="text-xs text-muted-foreground">Bookings this month</p>
          <p className="text-xl font-bold text-navy">{monthBookings.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-light-gray px-4 py-3">
          <p className="text-xs text-muted-foreground">Completed revenue</p>
          <p className="text-xl font-bold text-navy">KES {monthRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-light-gray px-4 py-3">
          <p className="text-xs text-muted-foreground">Upcoming</p>
          <p className="text-xl font-bold text-navy">
            {monthBookings.filter((b) => b.bookingStatus === "CONFIRMED" || b.bookingStatus === "PENDING").length}
          </p>
        </div>
      </div>

      {/* Calendar + detail panel side by side */}
      <div className="flex gap-4 items-start">
        {/* Calendar card — fixed width so it stays compact */}
        <div className="bg-white rounded-xl border border-light-gray p-4 w-80 shrink-0">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => { setViewMonth((m) => subMonths(m, 1)); setSelectedDay(null); }}
              className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-navy"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <h3 className="text-sm font-semibold text-navy">{format(viewMonth, "MMMM yyyy")}</h3>
            <button
              type="button"
              onClick={() => { setViewMonth((m) => addMonths(m, 1)); setSelectedDay(null); }}
              className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-navy"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-0.5 mb-0.5">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} className="text-center text-[10px] font-semibold text-muted-foreground py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: startPad }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {daysInMonth.map((date) => {
              const status = getDayBookingStatus(date, bookings, today);
              const isToday = isSameDay(date, today);
              const isSelected = selectedDay !== null && isSameDay(date, selectedDay);

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => setSelectedDay(isSelected ? null : date)}
                  className={cn(
                    "relative h-8 w-full rounded-md text-xs transition-all",
                    status ? dayStatusClass[status] : "text-foreground hover:bg-muted",
                    isToday && !status && "ring-2 ring-navy ring-inset",
                    isSelected && "ring-2 ring-offset-1 ring-navy",
                  )}
                >
                  {format(date, "d")}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-1.5 mt-4 pt-3 border-t border-light-gray">
            {[
              { label: "Active today", cls: "bg-success" },
              { label: "Confirmed upcoming", cls: "bg-royal" },
              { label: "Pending", cls: "bg-gold" },
              { label: "Completed", cls: "bg-navy/20" },
              { label: "Cancelled / Rejected", cls: "bg-danger/20" },
            ].map(({ label, cls }) => (
              <span key={label} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className={cn("w-2.5 h-2.5 rounded shrink-0", cls)} />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Day detail panel */}
        <div className="flex-1 min-w-0">
          {!selectedDay ? (
            <div className="bg-white rounded-xl border border-light-gray p-8 text-center text-muted-foreground h-full flex flex-col items-center justify-center gap-2">
              <CalendarDays className="h-8 w-8 opacity-20" />
              <p className="text-sm font-medium">Select a date</p>
              <p className="text-xs">Click any highlighted date on the calendar to see booking details</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-light-gray overflow-hidden">
              <div className="px-4 py-3 border-b border-light-gray bg-off-white flex items-center justify-between">
                <h4 className="text-sm font-semibold text-navy">
                  {format(selectedDay, "EEEE, MMMM d, yyyy")}
                </h4>
                <button
                  type="button"
                  onClick={() => setSelectedDay(null)}
                  className="text-muted-foreground hover:text-navy transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {selectedDayBookings.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No bookings on this day.
                </div>
              ) : (
                <div className="divide-y divide-light-gray">
                  {selectedDayBookings.map((b) => (
                    <button
                      key={b.bookingReference}
                      type="button"
                      onClick={() => { const bid = refToId.get(b.bookingReference); if (bid) router.push(`/admin/bookings/${bid}`); }}
                      className="w-full text-left px-4 py-3.5 hover:bg-off-white transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <p className="text-sm font-semibold text-navy">
                              {b.customerFirstName && b.customerLastName
                                ? `${b.customerFirstName} ${b.customerLastName}`
                                : b.bookingReference}
                            </p>
                            <StatusBadge status={b.bookingStatus} />
                          </div>
                          {b.customerEmail && (
                            <p className="text-xs text-muted-foreground truncate">{b.customerEmail}</p>
                          )}
                          <p className="text-xs text-muted-foreground font-mono">{b.bookingReference}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {format(parseISO(b.startDate), "MMM d")} — {format(parseISO(b.endDate), "MMM d, yyyy")}
                            {" · "}{b.numberOfDays} day{b.numberOfDays !== 1 ? "s" : ""}
                          </p>
                          {b.carWasDamaged && (
                            <p className="text-xs text-danger mt-0.5">Damage reported{b.inspectionComment ? ` — ${b.inspectionComment}` : ""}</p>
                          )}
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-1">
                          {b.bookingCost != null && (
                            <span className="text-sm font-semibold text-navy">
                              KES {b.bookingCost.toLocaleString()}
                            </span>
                          )}
                          <span className="text-xs text-royal font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            View booking →
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CarBookingsTab({ bookings, loading, carId, refToId }: { bookings: BookingHistoryResponse[]; loading: boolean; carId: string; refToId: Map<string, string> }) {
  const router = useRouter();
  const now = new Date();
  const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar");

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-light-gray p-5 animate-pulse h-20" />
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-light-gray p-12 text-center text-muted-foreground">
        <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-20" />
        <p className="font-medium">No bookings recorded for this vehicle</p>
      </div>
    );
  }

  const active = bookings.filter(
    (b) => b.bookingStatus === "CONFIRMED" && new Date(b.startDate) <= now && new Date(b.endDate) >= now
  );
  const upcoming = bookings.filter(
    (b) => (b.bookingStatus === "CONFIRMED" || b.bookingStatus === "PENDING") && new Date(b.startDate) > now
  );
  const past = bookings.filter(
    (b) => b.bookingStatus === "COMPLETED" || b.bookingStatus === "CANCELLED" || b.bookingStatus === "REJECTED"
  );

  const Section = ({ title, icon, items, accent }: {
    title: string;
    icon: React.ReactNode;
    items: BookingHistoryResponse[];
    accent: string;
  }) => items.length === 0 ? null : (
    <div className="mb-6">
      <h3 className={`flex items-center gap-2 text-sm font-semibold mb-3 ${accent}`}>
        {icon} {title} <span className="text-xs font-normal text-muted-foreground">({items.length})</span>
      </h3>
      <div className="space-y-2">
        {items.map((b) => (
          <button
            key={b.bookingReference}
            type="button"
            onClick={() => { const bid = refToId.get(b.bookingReference); if (bid) router.push(`/admin/bookings/${bid}`); }}
            className="w-full text-left flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl border border-light-gray px-5 py-4 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-navy/5 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-navy" />
              </div>
              <div>
                <p className="text-sm font-semibold text-navy">
                  {b.customerFirstName && b.customerLastName
                    ? `${b.customerFirstName} ${b.customerLastName}`
                    : b.bookingReference}
                </p>
                {b.customerEmail && (
                  <p className="text-xs text-muted-foreground">{b.customerEmail}</p>
                )}
                <p className="text-xs text-muted-foreground font-mono">{b.bookingReference}</p>
                <p className="text-xs text-muted-foreground">
                  {(() => { try { return format(new Date(b.startDate), "MMM d, yyyy"); } catch { return b.startDate; } })()}
                  {" — "}
                  {(() => { try { return format(new Date(b.endDate), "MMM d, yyyy"); } catch { return b.endDate; } })()}
                  {" · "}{b.numberOfDays} day{b.numberOfDays !== 1 ? "s" : ""}
                </p>
                {b.carWasDamaged && (
                  <p className="text-xs text-danger mt-0.5">
                    Damage reported{b.inspectionComment ? ` — ${b.inspectionComment}` : ""}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-navy">
                KES {(b.bookingCost ?? 0).toLocaleString()}
              </span>
              <StatusBadge status={b.bookingStatus} />
              <span className="text-xs text-royal font-medium opacity-0 group-hover:opacity-100 transition-opacity">View →</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {/* View toggle */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {bookings.length} booking{bookings.length !== 1 ? "s" : ""} total
        </p>
        <div className="flex gap-1 bg-white border border-light-gray rounded-lg p-1">
          <button
            type="button"
            onClick={() => setViewMode("calendar")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              viewMode === "calendar" ? "bg-navy text-white" : "text-muted-foreground hover:text-navy"
            )}
          >
            <CalendarDays className="h-3.5 w-3.5" /> Calendar
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              viewMode === "list" ? "bg-navy text-white" : "text-muted-foreground hover:text-navy"
            )}
          >
            <List className="h-3.5 w-3.5" /> List
          </button>
        </div>
      </div>

      {viewMode === "calendar" ? (
        <CarBookingsCalendar bookings={bookings} refToId={refToId} />
      ) : (
        <div>
          <Section
            title="Currently Active"
            icon={<Clock className="h-4 w-4" />}
            items={active}
            accent="text-success"
          />
          <Section
            title="Upcoming"
            icon={<CalendarDays className="h-4 w-4" />}
            items={upcoming}
            accent="text-royal"
          />
          <Section
            title="Past Bookings"
            icon={<CheckCircle2 className="h-4 w-4" />}
            items={past}
            accent="text-muted-foreground"
          />
        </div>
      )}
    </div>
  );
}
