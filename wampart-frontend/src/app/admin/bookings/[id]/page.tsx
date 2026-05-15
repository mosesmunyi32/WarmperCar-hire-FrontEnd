"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  User,
  Gauge,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import { toast } from "sonner";
import { bookingService } from "@/services/bookingServices";
import { AdminBooking, AdminCar, UserResponse } from "@/types";
import { format } from "date-fns";
import { carService } from "@/services/carServices";
import { customerServices } from "@/services/customerServices";

function fmt(iso: string) {
  try {
    return format(new Date(iso), "MMM d, yyyy");
  } catch {
    return iso;
  }
}

export default function AdminBookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<AdminBooking | null>(null);
  const [car, setCar] = useState<AdminCar | null>(null);
  const [customer, setCustomer] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [adminNote, setAdminNote] = useState("");
  const [mileageStart, setMileageStart] = useState("");
  const [mileageEnd, setMileageEnd] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [savingMileageStart, setSavingMileageStart] = useState(false);
  const [savingMileageEnd, setSavingMileageEnd] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    bookingService
      .getBookingByIdForAdmin(id)
      .then(async (b) => {
        setBooking(b);
        setAdminNote(b.adminNote ?? "");
        setMileageStart(b.mileageStart?.toString() ?? "");
        setMileageEnd(b.mileageEnd?.toString() ?? "");
        await Promise.allSettled([
          carService
            .getAdminCarById(b.carId)
            .then(setCar)
            .catch(() => null),
          customerServices
            .getCustomer(b.userId)
            .then(setCustomer)
            .catch(() => null),
        ]);
      })
      .catch(() => toast.error("Failed to load booking details."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    if (!booking) return;
    setApproving(true);
    try {
      const updated = await bookingService.approveOrRejectBooking(booking.id, {
        bookingStatus: "CONFIRMED",
        adminNote: adminNote || undefined,
      });
      setBooking(updated);
      toast.success("Booking approved successfully.");
    } catch {
      toast.error("Failed to approve booking.");
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!booking) return;
    setRejecting(true);
    try {
      const updated = await bookingService.approveOrRejectBooking(booking.id, {
        bookingStatus: "REJECTED",
        adminNote: adminNote || undefined,
      });
      setBooking(updated);
      toast.success("Booking rejected.");
    } catch {
      toast.error("Failed to reject booking.");
    } finally {
      setRejecting(false);
    }
  };

  const handleSaveMileageStart = async () => {
    if (!booking || !mileageStart) return;
    setSavingMileageStart(true);
    try {
      const updated = await bookingService.recordMileageStart(booking.id, {
        mileageStart: Number(mileageStart),
      });
      setBooking(updated);
      toast.success("Start mileage recorded.");
    } catch {
      toast.error("Failed to record start mileage.");
    } finally {
      setSavingMileageStart(false);
    }
  };

  const handleSaveMileageEnd = async () => {
    if (!booking || !mileageEnd) return;
    if (booking.mileageStart != null && Number(mileageEnd) <= booking.mileageStart) {
      toast.error(`End mileage must be greater than start mileage (${booking.mileageStart.toLocaleString()} km).`);
      return;
    }
    setSavingMileageEnd(true);
    try {
      const updated = await bookingService.recordMileageEnd(booking.id, {
        mileageEnd: Number(mileageEnd),
      });
      setBooking(updated);
      toast.success("End mileage recorded.");
    } catch {
      toast.error("Failed to record end mileage.");
    } finally {
      setSavingMileageEnd(false);
    }
  };

  const handleSaveNote = async () => {
    if (!booking) return;
    setSavingNote(true);
    try {
      const updated = await bookingService.approveOrRejectBooking(booking.id, {
        bookingStatus: booking.bookingStatus,
        adminNote,
      });
      setBooking(updated);
      toast.success("Note saved.");
    } catch {
      toast.error("Failed to save note.");
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-light-gray p-5 animate-pulse h-32"
          />
        ))}
      </div>
    );
  }

  if (!booking) {
    return (
      <div>
        <Link
          href="/admin/bookings"
          className="flex items-center gap-2 text-muted-foreground hover:text-navy text-sm mb-6 w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Bookings
        </Link>
        <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3">
          Booking not found.
        </div>
      </div>
    );
  }

  // const carLabel =
  //   [booking.carBrand, booking.carModel].filter(Boolean).join(" ") ||
  //   booking.carId;
  const numberPlate = car?.numberPlate ?? booking.carNumberPlate;
  const carFull = `${numberPlate} - ${car?.brand}, ${car?.model}`;
  const customerName = customer
    ? `${customer.firstName} ${customer.lastName}`.trim()
    : booking.userId;

  return (
    <div>
      <Link
        href="/admin/bookings"
        className="flex items-center gap-2 text-muted-foreground hover:text-navy text-sm mb-6 w-fit"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Bookings
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">
            {booking.bookingReference}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{carFull}</p>
        </div>
        <StatusBadge status={booking.bookingStatus} />
      </div>

      {!booking.mileageStart && (booking.bookingStatus === "PENDING" || booking.bookingStatus === "CONFIRMED") && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 mb-4">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-700">Start mileage not recorded — Action required</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Before handing over the car, you must record the current odometer reading as the start mileage.
              This is required to track distance travelled and mark the booking as active.
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        {/* Trip details */}
        <div className="bg-white rounded-xl border border-light-gray p-5 shadow-sm">
          <h2 className="font-semibold text-navy text-sm mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-royal" /> Trip Details
          </h2>
          <div className="space-y-2 text-sm">
            {[
              ["Car", carFull],
              ["Customer", customerName],
              ["customer ID Number", customer?.idNumber],
              ["Pick Up", fmt(booking.startDate)],
              ["Return", fmt(booking.endDate)],
              ["Destination", booking.travelDestination],
              ["Days", `${booking.numberOfDays} days`],
              ["Rate", `KES ${booking.pricePerDay.toLocaleString()} /day`],
              ["Total", `KES ${(booking.bookingCost ?? 0).toLocaleString()}`],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between gap-4">
                <span className="text-muted-foreground shrink-0">{l}</span>
                <span className="font-medium text-navy text-right">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {/* Mileage */}
          <div className="bg-white rounded-xl border border-light-gray p-5 shadow-sm">
            <h2 className="font-semibold text-navy text-sm mb-4 flex items-center gap-2">
              <Gauge className="h-4 w-4 text-royal" /> Mileage Record
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Start Mileage (km)
                </label>
                <Input
                  type="number"
                  value={mileageStart}
                  onChange={(e) => setMileageStart(e.target.value)}
                  className="h-9 text-sm"
                  placeholder="e.g. 45000"
                  disabled={!!booking.mileageStart}
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  End Mileage (km)
                </label>
                <Input
                  type="number"
                  value={mileageEnd}
                  onChange={(e) => setMileageEnd(e.target.value)}
                  className="h-9 text-sm"
                  placeholder="On return"
                  disabled={!!booking.mileageEnd}
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {!booking.mileageStart &&
                booking.bookingStatus === "CONFIRMED" && (
                  <Button
                    size="sm"
                    onClick={handleSaveMileageStart}
                    disabled={savingMileageStart || !mileageStart}
                    className="bg-navy hover:bg-royal text-xs h-8"
                  >
                    {savingMileageStart ? "Saving..." : "Record Start"}
                  </Button>
                )}
              {booking.mileageStart &&
                !booking.mileageEnd &&
                booking.bookingStatus === "CONFIRMED" && (
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      onClick={handleSaveMileageEnd}
                      disabled={savingMileageEnd || !mileageEnd || (booking.mileageStart != null && Number(mileageEnd) <= booking.mileageStart)}
                      className="bg-navy hover:bg-royal text-xs h-8"
                    >
                      {savingMileageEnd ? "Saving..." : "Record End"}
                    </Button>
                    {mileageEnd && booking.mileageStart != null && Number(mileageEnd) <= booking.mileageStart && (
                      <p className="text-xs text-danger">Must be greater than {booking.mileageStart.toLocaleString()} km</p>
                    )}
                  </div>
                )}

              {booking.bookingStatus === "COMPLETED" && (
                <p className="text-xs text-success font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Trip Completed with{" "}
                  {(
                    (booking.mileageEnd ?? 0) - (booking.mileageStart ?? 0)
                  ).toLocaleString()}{" "}
                  kilometers travelled
                </p>
              )}
            </div>
          </div>

          {/* Admin note */}
          <div className="bg-white rounded-xl border border-light-gray p-5 shadow-sm">
            <h2 className="font-semibold text-navy text-sm mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-royal" /> Notes
            </h2>
            {booking.customerNote && (
              <div className="bg-off-white rounded-lg p-3 border border-light-gray text-xs text-muted-foreground mb-3">
                <span className="font-medium text-navy">Customer: </span>
                {booking.customerNote}
              </div>
            )}
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={3}
              placeholder="Add admin note..."
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <Button
              size="sm"
              onClick={handleSaveNote}
              disabled={savingNote}
              className="mt-2 bg-navy hover:bg-royal text-xs h-8"
            >
              {savingNote ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </div>
      </div>

      {/* Approve / Reject */}
      {booking.bookingStatus === "PENDING" && (
        <div className="bg-white rounded-xl border border-light-gray p-5 shadow-sm">
          <h2 className="font-semibold text-navy text-sm mb-3">
            Booking Actions
          </h2>
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={handleApprove}
              disabled={approving}
              className="bg-success hover:bg-success/90 text-white gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              {approving ? "Approving..." : "Approve Booking"}
            </Button>
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={rejecting}
              className="border-danger/30 text-danger hover:bg-danger/5 gap-2"
            >
              <XCircle className="h-4 w-4" />
              {rejecting ? "Rejecting..." : "Reject Booking"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
