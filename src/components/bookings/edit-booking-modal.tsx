"use client";

import { useEffect, useState } from "react";
import { Calendar, MapPin, X, Pencil } from "lucide-react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bookingService } from "@/services/bookingServices";
import { carService } from "@/services/carServices";
import { Booking } from "@/types";
import { toast } from "sonner";

interface EditBookingModalProps {
  open: boolean;
  booking: Booking;
  onClose: () => void;
  onUpdated: (updated: Booking) => void;
}

export function EditBookingModal({
  open,
  booking,
  onClose,
  onUpdated,
}: EditBookingModalProps) {
  const [startDate, setStartDate] = useState(booking.startDate);
  const [endDate, setEndDate] = useState(booking.endDate);
  const [destination, setDestination] = useState(booking.travelDestination);
  const [bookedRanges, setBookedRanges] = useState<
    { startDate: string; endDate: string }[]
  >([]);
  const [saving, setSaving] = useState(false);

  // Re-seed fields and load booked ranges each time the modal opens.
  useEffect(() => {
    if (!open) return;
    setStartDate(booking.startDate);
    setEndDate(booking.endDate);
    setDestination(booking.travelDestination);

    const bStart = new Date(booking.startDate).getTime();
    const bEnd = new Date(booking.endDate).getTime();
    carService
      .getBookedDateRanges(booking.carId)
      .then((ranges) =>
        setBookedRanges(
          // Drop this booking's own slot so the user can re-select those days.
          ranges.filter((r) => {
            const rStart = new Date(r.startDate).getTime();
            const rEnd = new Date(r.endDate).getTime();
            return !(rStart <= bEnd && rEnd >= bStart);
          }),
        ),
      )
      .catch(() => setBookedRanges([]));
  }, [open, booking]);

  const days =
    startDate && endDate
      ? Math.max(
          0,
          Math.round(
            (new Date(endDate).getTime() - new Date(startDate).getTime()) /
              86400000,
          ),
        )
      : 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await bookingService.updateBooking(booking.id, {
        startDate,
        endDate,
        travelDestination: destination.trim(),
      });
      toast.success("Booking updated.");
      onUpdated(updated);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg ?? "Failed to update booking.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto p-4 sm:py-10">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={saving ? undefined : onClose}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl border border-light-gray shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-light-gray">
          <h2 className="font-bold text-navy text-base flex items-center gap-2">
            <Pencil className="h-4 w-4 text-royal" /> Edit Booking
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="text-muted-foreground hover:text-navy transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <p className="text-xs text-muted-foreground font-mono">
            {booking.bookingReference}
          </p>

          <div>
            <label className="text-sm font-medium text-navy mb-1.5 flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> Pick Up → Return Dates
            </label>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              bookedRanges={bookedRanges}
              onRangeChange={(s, e) => {
                setStartDate(s);
                setEndDate(e);
              }}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-navy mb-1.5 flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> Travel Destination
            </label>
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Nakuru"
              className="h-10"
            />
          </div>

          {days > 0 && (
            <div className="bg-off-white rounded-lg p-3 border border-light-gray text-sm flex items-center justify-between">
              <span className="text-muted-foreground">
                Duration:{" "}
                <span className="font-semibold text-navy">
                  {days} day{days !== 1 ? "s" : ""}
                </span>
              </span>
              <span className="text-muted-foreground">
                Est. total:{" "}
                <span className="font-semibold text-royal">
                  KES {(days * booking.pricePerDay).toLocaleString()}
                </span>
              </span>
            </div>
          )}

          {days > 0 && days < 2 && (
            <p className="text-xs text-danger">
              Minimum booking duration is 2 days.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-light-gray">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="text-sm text-muted-foreground hover:text-navy transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <Button
            onClick={handleSave}
            disabled={saving || days < 2 || !destination.trim()}
            className="bg-royal hover:bg-navy text-white gap-2"
          >
            <Pencil className="h-4 w-4" />
            {saving ? "Saving…" : "Update Booking"}
          </Button>
        </div>
      </div>
    </div>
  );
}
