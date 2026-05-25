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
  Download,
  RefreshCw,
  Car as CarIcon,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import { toast } from "sonner";
import { bookingService } from "@/services/bookingServices";
import { inspectionService } from "@/services/inspectionService";
import { AdminBooking, AdminCar, AdminInspectionResponse, UserResponse, CreateInspectionRequest, UpdateInspectionRequest } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { carService } from "@/services/carServices";
import { customerServices } from "@/services/customerServices";
import { AdminInspectionCard } from "@/components/inspection/inspection-card";
import { InspectionForm } from "@/components/inspection/inspection-form";

function fmt(iso: string) {
  try {
    return format(new Date(iso), "MMM d, yyyy");
  } catch {
    return iso;
  }
}

// ─── Admin Inspection Tabs ────────────────────────────────────────────────────
interface AdminInspectionTabsProps {
  booking: AdminBooking;
  preInspection: AdminInspectionResponse | undefined;
  postInspection: AdminInspectionResponse | undefined;
  inspections: AdminInspectionResponse[];
  inspectionsLoading: boolean;
  inspectionForm: "create-pre" | "create-post" | "edit" | null;
  editingInspection: AdminInspectionResponse | null;
  submittingInspection: boolean;
  confirmingOnBehalfId: string | null;
  setInspectionForm: (v: "create-pre" | "create-post" | "edit" | null) => void;
  setEditingInspection: (v: AdminInspectionResponse | null) => void;
  handleInspectionSubmit: (data: CreateInspectionRequest | UpdateInspectionRequest) => Promise<void>;
  handleConfirmOnBehalf: (id: string) => Promise<void>;
}

function AdminInspectionTabs({
  booking,
  preInspection,
  postInspection,
  inspectionsLoading,
  inspectionForm,
  editingInspection,
  submittingInspection,
  confirmingOnBehalfId,
  setInspectionForm,
  setEditingInspection,
  handleInspectionSubmit,
  handleConfirmOnBehalf,
}: AdminInspectionTabsProps) {
  const [activeTab, setActiveTab] = useState<"PRE" | "POST">("PRE");

  const pendingPre = preInspection?.customerResponse === "PENDING";
  const pendingPost = postInspection?.customerResponse === "PENDING";
  const confirmedPre = preInspection?.customerResponse === "CONFIRMED";
  const confirmedPost = postInspection?.customerResponse === "CONFIRMED";

  const canAddPre = booking.bookingStatus === "CONFIRMED" && !preInspection && inspectionForm !== "create-pre";
  const canAddPost =
    booking.bookingStatus === "COMPLETED" &&
    preInspection?.customerResponse === "CONFIRMED" &&
    !postInspection &&
    inspectionForm !== "create-post";

  const activeInspection = activeTab === "PRE" ? preInspection : postInspection;
  const isFormForActiveTab =
    (activeTab === "PRE" && (inspectionForm === "create-pre" || (inspectionForm === "edit" && editingInspection?.inspectionType === "PRE_INSPECTION"))) ||
    (activeTab === "POST" && (inspectionForm === "create-post" || (inspectionForm === "edit" && editingInspection?.inspectionType === "POST_INSPECTION")));

  return (
    <div className="bg-white rounded-xl border border-light-gray shadow-sm overflow-hidden mb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-light-gray">
        <h2 className="font-semibold text-navy text-sm flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-royal" /> Inspections
        </h2>
        <div className="flex gap-2">
          {activeTab === "PRE" && canAddPre && (
            <Button
              size="sm"
              onClick={() => setInspectionForm("create-pre")}
              className="bg-royal hover:bg-navy text-white gap-1.5 text-xs h-8"
            >
              <Plus className="h-3.5 w-3.5" /> Add Pre-Inspection
            </Button>
          )}
          {activeTab === "POST" && canAddPost && (
            <Button
              size="sm"
              onClick={() => setInspectionForm("create-post")}
              className="bg-navy hover:bg-royal text-white gap-1.5 text-xs h-8"
            >
              <Plus className="h-3.5 w-3.5" /> Add Post-Inspection
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-light-gray px-5">
        {(["PRE", "POST"] as const).map((tab) => {
          const isPre = tab === "PRE";
          const hasDot = isPre ? (pendingPre || confirmedPre) : (pendingPost || confirmedPost);
          const dotColor = isPre
            ? (confirmedPre ? "bg-success" : "bg-gold")
            : (confirmedPost ? "bg-success" : "bg-gold");
          return (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                if (inspectionForm && !isFormForActiveTab) {
                  setInspectionForm(null);
                  setEditingInspection(null);
                }
              }}
              className={cn(
                "relative flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors",
                activeTab === tab
                  ? "border-royal text-royal"
                  : "border-transparent text-muted-foreground hover:text-navy"
              )}
            >
              {isPre ? "Pre-Inspection" : "Post-Inspection"}
              {hasDot && (
                <span className={cn("h-1.5 w-1.5 rounded-full", dotColor)} />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="px-5 py-4 space-y-3">
        {inspectionsLoading ? (
          <div className="h-20 bg-light-gray rounded-lg animate-pulse" />
        ) : activeInspection ? (
          <>
            <AdminInspectionCard
              inspection={activeInspection}
              onEdit={() => { setEditingInspection(activeInspection); setInspectionForm("edit"); }}
              onConfirmOnBehalf={() => handleConfirmOnBehalf(activeInspection.id)}
              confirmingOnBehalf={confirmingOnBehalfId === activeInspection.id}
            />
            {isFormForActiveTab && inspectionForm === "edit" && (
              <div className="border border-light-gray rounded-xl p-4 bg-off-white mt-3">
                <h3 className="text-xs font-semibold text-navy mb-3">Edit Inspection</h3>
                <InspectionForm
                  bookingId={booking.id}
                  isPost={activeTab === "POST"}
                  initial={editingInspection ? {
                    condition: editingInspection.condition,
                    isDamaged: editingInspection.isDamaged,
                    inspectionComment: editingInspection.inspectionComment ?? undefined,
                    damagedPhotos: editingInspection.damagedPhotos,
                    isDamageChargeRequired: editingInspection.isDamageChargeRequired ?? undefined,
                    damageChargeAmount: editingInspection.damageChargeAmount ?? undefined,
                  } : undefined}
                  submitLabel="Save Changes"
                  submitting={submittingInspection}
                  onSubmit={handleInspectionSubmit}
                  onCancel={() => { setInspectionForm(null); setEditingInspection(null); }}
                  showEditWarning
                />
              </div>
            )}
          </>
        ) : isFormForActiveTab ? null : (
          <div className="text-center py-6">
            <ClipboardList className="h-8 w-8 text-light-gray mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {activeTab === "PRE"
                ? "No pre-inspection recorded yet."
                : !preInspection
                  ? "Complete pre-inspection first."
                  : !confirmedPre
                    ? "Awaiting customer confirmation of pre-inspection."
                    : "No post-inspection recorded yet."}
            </p>
          </div>
        )}

        {/* Create form shown below existing card or alone */}
        {isFormForActiveTab && (inspectionForm === "create-pre" || inspectionForm === "create-post") && (
          <div className="border border-light-gray rounded-xl p-4 bg-off-white">
            <h3 className="text-xs font-semibold text-navy mb-3">
              {inspectionForm === "create-pre" ? "New Pre-Inspection" : "New Post-Inspection"}
            </h3>
            <InspectionForm
              bookingId={booking.id}
              isPost={inspectionForm === "create-post"}
              submitLabel="Submit Inspection"
              submitting={submittingInspection}
              onSubmit={handleInspectionSubmit}
              onCancel={() => setInspectionForm(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
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
  const [generatingReceipt, setGeneratingReceipt] = useState(false);
  const [showReassign, setShowReassign] = useState(false);
  const [allCars, setAllCars] = useState<AdminCar[]>([]);
  const [carsLoading, setCarsLoading] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState("");
  const [reassignNote, setReassignNote] = useState("");
  const [reassigning, setReassigning] = useState(false);

  const [inspections, setInspections] = useState<AdminInspectionResponse[]>([]);
  const [inspectionsLoading, setInspectionsLoading] = useState(false);
  const [inspectionForm, setInspectionForm] = useState<"create-pre" | "create-post" | "edit" | null>(null);
  const [editingInspection, setEditingInspection] = useState<AdminInspectionResponse | null>(null);
  const [submittingInspection, setSubmittingInspection] = useState(false);
  const [confirmingOnBehalfId, setConfirmingOnBehalfId] = useState<string | null>(null);

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

  useEffect(() => {
    if (!booking) return;
    setInspectionsLoading(true);
    inspectionService
      .getBookingInspectionsForAdmin(booking.id)
      .then(setInspections)
      .catch(() => {})
      .finally(() => setInspectionsLoading(false));
  }, [booking?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const preInspection = inspections.find((i) => i.inspectionType === "PRE_INSPECTION");
  const postInspection = inspections.find((i) => i.inspectionType === "POST_INSPECTION");

  const handleInspectionSubmit = async (data: CreateInspectionRequest | UpdateInspectionRequest) => {
    if (!booking) return;
    setSubmittingInspection(true);
    try {
      if (inspectionForm === "edit" && editingInspection) {
        const updated = await inspectionService.updateInspection(editingInspection.id, data as UpdateInspectionRequest);
        setInspections((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
        toast.success("Inspection updated.");
      } else {
        const created = inspectionForm === "create-post"
          ? await inspectionService.createPostInspection(data as CreateInspectionRequest)
          : await inspectionService.createPreInspection(data as CreateInspectionRequest);
        setInspections((prev) => [...prev, created]);
        toast.success(inspectionForm === "create-post" ? "Post-inspection created." : "Pre-inspection created.");

        // Auto-mark car unavailable when a damage charge is recorded on post-inspection
        if (inspectionForm === "create-post") {
          const postData = data as CreateInspectionRequest;
          if (postData.isDamageChargeRequired && car?.isAvailable) {
            try {
              const result = await carService.toggleAvailability(booking.carId);
              setCar((prev) => prev ? { ...prev, isAvailable: result.available } : prev);
              toast.info("Car automatically marked as unavailable due to damage charge.");
            } catch {}
          }
        }
      }
      setInspectionForm(null);
      setEditingInspection(null);
    } catch {
      toast.error("Failed to save inspection.");
    } finally {
      setSubmittingInspection(false);
    }
  };

  const handleConfirmOnBehalf = async (inspectionId: string) => {
    setConfirmingOnBehalfId(inspectionId);
    try {
      await inspectionService.respondToInspection(inspectionId, { customerResponse: "CONFIRMED" });
      setInspections((prev) =>
        prev.map((i) => (i.id === inspectionId ? { ...i, customerResponse: "CONFIRMED" as const } : i))
      );
      toast.success("Inspection confirmed on behalf of customer.");
    } catch {
      toast.error("Failed to confirm inspection.");
    } finally {
      setConfirmingOnBehalfId(null);
    }
  };

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

  const handleGenerateReceipt = async () => {
    if (!booking) return;
    setGeneratingReceipt(true);
    try {
      const url = await bookingService.generateReceipt(booking.id);
      setBooking((b) => b ? { ...b, receiptUrl: url } : b);
      toast.success("Receipt generated.");
    } catch {
      toast.error("Failed to generate receipt.");
    } finally {
      setGeneratingReceipt(false);
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

  const handleToggleReassign = async () => {
    if (!showReassign && allCars.length === 0 && booking) {
      setCarsLoading(true);
      try {
        const cars = await carService.getAllCarsForAdmin();
        // Exclude current car and cars manually marked unavailable
        const candidates = cars.filter((c) => c.id !== booking.carId && c.isAvailable);

        // Check each car's booked date ranges against the booking's dates
        const bookingStart = new Date(booking.startDate);
        const bookingEnd = new Date(booking.endDate);

        const rangeResults = await Promise.allSettled(
          candidates.map((c) => carService.getBookedDateRanges(c.id))
        );

        const availableForDates = candidates.filter((_, i) => {
          const res = rangeResults[i];
          if (res.status === "rejected") return true; // allow if check fails
          return !res.value.some(
            (r) =>
              new Date(r.startDate) <= bookingEnd &&
              new Date(r.endDate) >= bookingStart
          );
        });

        setAllCars(availableForDates);
      } catch {
        toast.error("Failed to load cars.");
      } finally {
        setCarsLoading(false);
      }
    }
    setShowReassign((v) => !v);
    setSelectedCarId("");
  };

  const handleReassign = async () => {
    if (!booking || !selectedCarId) return;
    const selectedCar = allCars.find((c) => c.id === selectedCarId);
    if (!selectedCar) return;
    setReassigning(true);
    try {
      const updated = await bookingService.reassignCar(booking.id, selectedCar.numberPlate, reassignNote || undefined);
      setBooking(updated);
      setCar(selectedCar);
      setShowReassign(false);
      setSelectedCarId("");
      setReassignNote("");
      toast.success("Booking reassigned to a new vehicle.");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? "Failed to reassign booking.");
    } finally {
      setReassigning(false);
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
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge status={booking.bookingStatus} />
          {booking.receiptUrl ? (
            <a
              href={booking.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium h-8 px-3 rounded-md border border-royal/30 text-royal hover:bg-royal/5 transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> Open Receipt
            </a>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerateReceipt}
              disabled={generatingReceipt}
              className="border-royal/30 text-royal hover:bg-royal/5 gap-1.5 text-xs h-8"
            >
              <Download className="h-3.5 w-3.5" />
              {generatingReceipt ? "Generating…" : "Generate Receipt"}
            </Button>
          )}
        </div>
      </div>

      {/* ── 1. PRIMARY ACTION — Approve / Reject (PENDING only, shown first) ── */}
      {booking.bookingStatus === "PENDING" && (
        <div className="bg-white rounded-xl border border-light-gray p-5 shadow-sm mb-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h2 className="font-semibold text-navy text-sm">Booking Awaiting Approval</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Confirm the customer&apos;s identity and verify payment before approving.{" "}
                <Link href={`/admin/customers/${booking.userId}`} className="text-royal hover:underline">
                  View customer profile →
                </Link>
              </p>
            </div>
          </div>
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

      {/* ── 2. CONTEXT BANNERS — inspection status (CONFIRMED only) ── */}
      {booking.bookingStatus === "CONFIRMED" && !preInspection && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 mb-4">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-700">Step 1 — Complete pre-inspection before handover</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Record the pre-inspection below, then have the customer confirm it. Start mileage can only be entered after confirmation.
            </p>
          </div>
        </div>
      )}
      {booking.bookingStatus === "CONFIRMED" && preInspection && preInspection.customerResponse !== "CONFIRMED" && !booking.mileageStart && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 mb-4">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-700">Step 2 — Awaiting customer confirmation of pre-inspection</p>
            <p className="text-xs text-amber-600 mt-0.5">
              The customer must confirm the pre-inspection before you can record the start mileage and hand over the vehicle.
            </p>
          </div>
        </div>
      )}
      {booking.bookingStatus === "CONFIRMED" && preInspection?.customerResponse === "CONFIRMED" && !booking.mileageStart && (
        <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-300 rounded-xl px-4 py-3 mb-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-700">Step 3 — Pre-inspection confirmed. Record start mileage to hand over.</p>
            <p className="text-xs text-emerald-600 mt-0.5">
              Enter the odometer reading below and click &quot;Record Start&quot; to complete the handover.
            </p>
          </div>
        </div>
      )}

      {/* ── 3. INFO GRID — Trip Details + Notes ── */}
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
              ["Customer ID Number", customer?.idNumber],
              ["Pick Up", fmt(booking.startDate)],
              ["Return", fmt(booking.endDate)],
              ["Destination", booking.travelDestination],
              ["Days", `${booking.numberOfDays} days`],
              ["Rate", `KES ${booking.pricePerDay.toLocaleString()} /day`],
              ["Total", `KES ${(booking.bookingCost ?? 0).toLocaleString()}`],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between gap-4">
                <span className="text-muted-foreground shrink-0">{l}</span>
                <span className="font-medium text-navy text-right">{v ?? "—"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
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
            rows={4}
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

      {/* ── 4. INSPECTIONS — must happen before mileage ── */}
      {(booking.bookingStatus === "CONFIRMED" || booking.bookingStatus === "COMPLETED") && (
        <AdminInspectionTabs
          booking={booking}
          preInspection={preInspection}
          postInspection={postInspection}
          inspections={inspections}
          inspectionsLoading={inspectionsLoading}
          inspectionForm={inspectionForm}
          editingInspection={editingInspection}
          submittingInspection={submittingInspection}
          confirmingOnBehalfId={confirmingOnBehalfId}
          setInspectionForm={setInspectionForm}
          setEditingInspection={setEditingInspection}
          handleInspectionSubmit={handleInspectionSubmit}
          handleConfirmOnBehalf={handleConfirmOnBehalf}
        />
      )}

      {/* ── 5. MILEAGE — only after inspection is done ── */}
      {(booking.bookingStatus === "CONFIRMED" || booking.bookingStatus === "COMPLETED") && (
        <div className="bg-white rounded-xl border border-light-gray p-5 shadow-sm mb-4">
          <h2 className="font-semibold text-navy text-sm mb-4 flex items-center gap-2">
            <Gauge className="h-4 w-4 text-royal" /> Mileage Record
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Start Mileage (km)</label>
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
              <label className="block text-xs text-muted-foreground mb-1">End Mileage (km)</label>
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
          <div className="flex gap-2 flex-wrap items-center">
            {!booking.mileageStart && booking.bookingStatus === "CONFIRMED" && (
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  onClick={handleSaveMileageStart}
                  disabled={savingMileageStart || !mileageStart || !preInspection || preInspection.customerResponse !== "CONFIRMED"}
                  className="bg-navy hover:bg-royal text-xs h-8"
                >
                  {savingMileageStart ? "Saving..." : "Record Start"}
                </Button>
                {(!preInspection || preInspection.customerResponse !== "CONFIRMED") && (
                  <p className="text-xs text-amber-600">Complete &amp; confirm pre-inspection first</p>
                )}
              </div>
            )}
            {booking.mileageStart && !booking.mileageEnd && booking.bookingStatus === "CONFIRMED" && (
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
            {booking.mileageStart && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Start: <span className="font-semibold text-navy">{booking.mileageStart.toLocaleString()} km</span></span>
                {booking.mileageEnd && (
                  <>
                    <span>End: <span className="font-semibold text-navy">{booking.mileageEnd.toLocaleString()} km</span></span>
                    <span className="text-success font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {((booking.mileageEnd ?? 0) - (booking.mileageStart ?? 0)).toLocaleString()} km travelled
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reassign Car */}
      {(booking.bookingStatus === "PENDING" || booking.bookingStatus === "CONFIRMED") && (
        <div className="bg-white rounded-xl border border-light-gray shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={handleToggleReassign}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-off-white transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-warning/10 border border-warning/20 flex items-center justify-center">
                <RefreshCw className="h-4 w-4 text-warning" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-navy text-sm">Change Car in This Booking</p>
                <p className="text-xs text-muted-foreground">Swap the vehicle — dates and destination stay the same</p>
              </div>
            </div>
            {showReassign ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>

          {showReassign && (
            <div className="border-t border-light-gray px-5 py-4">
              {carsLoading ? (
                <div className="space-y-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-14 bg-light-gray rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : allCars.length === 0 ? (
                <div className="text-center py-6">
                  <CarIcon className="h-8 w-8 text-light-gray mx-auto mb-2" />
                  <p className="text-sm font-medium text-navy">No vehicles available for these dates</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    All other cars are already booked from {fmt(booking.startDate)} to {fmt(booking.endDate)}.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground mb-3">
                    Showing <span className="font-semibold text-navy">{allCars.length}</span> car{allCars.length !== 1 ? "s" : ""} confirmed free from{" "}
                    <span className="font-semibold text-navy">{fmt(booking.startDate)}</span> to{" "}
                    <span className="font-semibold text-navy">{fmt(booking.endDate)}</span>.
                    The customer keeps the same dates and destination.
                  </p>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1 mb-4">
                    {allCars.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCarId(c.id)}
                        className={cn(
                          "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg border text-left transition-all",
                          selectedCarId === c.id
                            ? "border-royal bg-royal/5 shadow-sm"
                            : "border-light-gray hover:border-royal/40"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-navy/5 flex items-center justify-center shrink-0">
                            <CarIcon className="h-4 w-4 text-navy/50" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-navy">
                              {c.brand} {c.model} <span className="font-normal text-muted-foreground">· {c.yearOfManufacture}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">{c.numberPlate} · KES {c.pricePerDay.toLocaleString()}/day</p>
                          </div>
                        </div>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0 bg-success/10 text-success border border-success/20">
                          Free for dates
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="mb-4">
                    <label className="text-xs font-medium text-navy block mb-1.5">
                      Admin Note <span className="text-muted-foreground font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={reassignNote}
                      onChange={(e) => setReassignNote(e.target.value)}
                      placeholder="Reason for reassignment or any notes for the customer…"
                      rows={2}
                      className="w-full rounded-lg border border-light-gray bg-off-white px-3 py-2 text-sm text-navy placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleReassign}
                      disabled={!selectedCarId || reassigning}
                      className="bg-warning hover:bg-warning/90 text-white gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      {reassigning ? "Reassigning..." : "Confirm Reassignment"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => { setShowReassign(false); setSelectedCarId(""); setReassignNote(""); }}
                      disabled={reassigning}
                      className="text-muted-foreground"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
