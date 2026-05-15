"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { customerServices } from "@/services/customerServices";
import { bookingService } from "@/services/bookingServices";
import { profileService } from "@/services/profileService";
import { UserResponse, AdminBooking } from "@/types";
import { EditForm, EDIT_FORM_INIT } from "./_components/types";
import { PhotoModal } from "./_components/photo-modal";
import { CustomerHeader } from "./_components/customer-header";
import { InfoCard } from "./_components/info-card";
import { DocumentsCard } from "./_components/documents-card";
import { BookingHistory } from "./_components/booking-history";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [customer, setCustomer] = useState<UserResponse | null>(null);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [photoModal, setPhotoModal] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>(EDIT_FORM_INIT);
  const [savingInfo, setSavingInfo] = useState(false);

  const [stagedFront, setStagedFront] = useState<File | null>(null);
  const [stagedBack, setStagedBack] = useState<File | null>(null);
  const [uploadingIdPhotos, setUploadingIdPhotos] = useState(false);
  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);
  const [deletingFront, setDeletingFront] = useState(false);
  const [deletingBack, setDeletingBack] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState(false);

  useEffect(() => {
    Promise.all([
      customerServices.getCustomer(id),
      bookingService.getCustomerBookings(id).catch(() => [] as AdminBooking[]),
      profileService.getMyProfile(id).catch(() => null as UserResponse | null),
    ])
      .then(([c, b, profile]) => {
        setCustomer({
          ...c,
          idFrontPhoto: c.idFrontPhoto ?? profile?.idFrontPhoto ?? null,
          idBackPhoto: c.idBackPhoto ?? profile?.idBackPhoto ?? null,
          profilePhoto: c.profilePhoto ?? profile?.profilePhoto ?? null,
        });
        setBookings(b);
      })
      .catch(() => toast.error("Failed to load customer details."))
      .finally(() => setLoading(false));
  }, [id]);

  function apiMsg(err: unknown): string {
    return (
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? ""
    );
  }

  // ── Info edit ──────────────────────────────────────────────────────────────
  const handleStartEdit = () => {
    if (!customer) return;
    setEditForm({
      firstName: customer.firstName ?? "",
      lastName: customer.lastName ?? "",
      email: customer.email ?? "",
      phoneNumber: customer.phoneNumber ?? "",
      alternativePhoneNumber: customer.alternativePhoneNumber ?? "",
      dateOfBirth: customer.dateOfBirth ?? "",
      gender: customer.gender ?? "",
      county: customer.county ?? "",
      city: customer.city ?? "",
      idNumber: customer.idNumber ?? "",
      driversLicenceNumber: customer.driversLicenceNumber ?? "",
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    setSavingInfo(true);
    try {
      const updated = await customerServices.updateCustomer(id, {
        firstName: editForm.firstName || undefined,
        lastName: editForm.lastName || undefined,
        email: editForm.email || undefined,
        phoneNumber: editForm.phoneNumber || undefined,
        alternativePhoneNumber: editForm.alternativePhoneNumber || undefined,
        dateOfBirth: editForm.dateOfBirth || undefined,
        gender: editForm.gender || undefined,
        county: editForm.county || undefined,
        city: editForm.city || undefined,
        idNumber: editForm.idNumber || undefined,
        driversLicenceNumber: editForm.driversLicenceNumber || undefined,
      });
      setCustomer((c) => (c ? { ...c, ...updated } : c));
      setIsEditing(false);
      toast.success("Customer information updated.");
    } catch (err) {
      toast.error(apiMsg(err) || "Failed to update customer information.");
    } finally {
      setSavingInfo(false);
    }
  };

  // ── Photo uploads ──────────────────────────────────────────────────────────
  const handleIdPhotosUpload = async () => {
    if (!stagedFront || !stagedBack) return;
    setUploadingIdPhotos(true);
    try {
      const form = new FormData();
      if (stagedFront) form.append("FrontPhoto", stagedFront);
      if (stagedBack) form.append("BackPhoto", stagedBack);
      await profileService.updateIdPhotos(id, form);
      if (stagedFront)
        setCustomer((c) => (c ? { ...c, idFrontPhoto: URL.createObjectURL(stagedFront) } : c));
      if (stagedBack)
        setCustomer((c) => (c ? { ...c, idBackPhoto: URL.createObjectURL(stagedBack) } : c));
      setStagedFront(null);
      setStagedBack(null);
      toast.success("ID photos updated.");
    } catch (err) {
      toast.error(apiMsg(err) || "Failed to upload ID photos.");
    } finally {
      setUploadingIdPhotos(false);
    }
  };

  const handleProfilePhotoUpload = async (file: File) => {
    setUploadingProfilePhoto(true);
    try {
      const form = new FormData();
      form.append("file", file);
      await profileService.updateProfilePhoto(id, form);
      setCustomer((c) => (c ? { ...c, profilePhoto: URL.createObjectURL(file) } : c));
      toast.success("Profile photo updated.");
    } catch (err) {
      toast.error(apiMsg(err) || "Failed to upload profile photo.");
    } finally {
      setUploadingProfilePhoto(false);
    }
  };

  // ── Photo deletes ──────────────────────────────────────────────────────────
  const handleDeleteIdFront = async () => {
    setDeletingFront(true);
    try {
      await customerServices.deleteIdFrontPhoto(id);
      setCustomer((c) => (c ? { ...c, idFrontPhoto: null } : c));
      toast.success("ID front photo deleted.");
    } catch (err) {
      toast.error(apiMsg(err) || "Failed to delete ID front photo.");
    } finally {
      setDeletingFront(false);
    }
  };

  const handleDeleteIdBack = async () => {
    setDeletingBack(true);
    try {
      await customerServices.deleteIdBackPhoto(id);
      setCustomer((c) => (c ? { ...c, idBackPhoto: null } : c));
      toast.success("ID back photo deleted.");
    } catch (err) {
      toast.error(apiMsg(err) || "Failed to delete ID back photo.");
    } finally {
      setDeletingBack(false);
    }
  };

  const handleDeleteProfilePhoto = async () => {
    setDeletingProfile(true);
    try {
      await customerServices.deleteProfilePhoto(id);
      setCustomer((c) => (c ? { ...c, profilePhoto: null } : c));
      toast.success("Profile photo deleted.");
    } catch (err) {
      toast.error(apiMsg(err) || "Failed to delete profile photo.");
    } finally {
      setDeletingProfile(false);
    }
  };

  // ── Status actions ─────────────────────────────────────────────────────────
  const handleActivate = async () => {
    setActionBusy("activate");
    try {
      await customerServices.activateUser(id);
      setCustomer((c) => (c ? { ...c, isActive: true } : c));
      toast.success("Customer activated.");
    } catch (err) {
      if (apiMsg(err).toLowerCase().includes("already activated")) {
        setCustomer((c) => (c ? { ...c, isActive: true } : c));
        toast.info("Customer is already active.");
      } else {
        toast.error("Failed to activate customer.");
      }
    } finally {
      setActionBusy(null);
    }
  };

  const handleDeactivate = async () => {
    setActionBusy("deactivate");
    try {
      await customerServices.deactivateUser(id);
      setCustomer((c) => (c ? { ...c, isActive: false } : c));
      toast.success("Customer blacklisted.");
    } catch (err) {
      if (apiMsg(err).toLowerCase().includes("already")) {
        setCustomer((c) => (c ? { ...c, isActive: false } : c));
        toast.info("Customer is already blacklisted.");
      } else {
        toast.error("Failed to blacklist customer.");
      }
    } finally {
      setActionBusy(null);
    }
  };

  const handleVerify = async () => {
    setActionBusy("verify");
    try {
      await customerServices.verifyUser(id);
      setCustomer((c) => (c ? { ...c, isVerified: true } : c));
      toast.success("Customer verified.");
    } catch {
      toast.error("Failed to verify customer.");
    } finally {
      setActionBusy(null);
    }
  };

  const handleUnverify = async () => {
    setActionBusy("unverify");
    try {
      await customerServices.unverifyUser(id);
      setCustomer((c) => (c ? { ...c, isVerified: false } : c));
      toast.success("Customer unverified.");
    } catch {
      toast.error("Failed to unverify customer.");
    } finally {
      setActionBusy(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-light-gray p-5 animate-pulse h-40" />
        ))}
      </div>
    );
  }

  if (!customer) {
    return (
      <div>
        <Link href="/admin/customers" className="flex items-center gap-2 text-muted-foreground hover:text-navy text-sm mb-6 w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to Customers
        </Link>
        <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3">
          Customer not found.
        </div>
      </div>
    );
  }

  return (
    <div>
      {photoModal && <PhotoModal src={photoModal} onClose={() => setPhotoModal(null)} />}

      <Link href="/admin/customers" className="flex items-center gap-2 text-muted-foreground hover:text-navy text-sm mb-6 w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Customers
      </Link>

      <CustomerHeader
        customer={customer}
        isEditing={isEditing}
        actionBusy={actionBusy}
        onStartEdit={handleStartEdit}
        onVerify={handleVerify}
        onUnverify={handleUnverify}
        onActivate={handleActivate}
        onDeactivate={handleDeactivate}
      />

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <InfoCard
          customer={customer}
          isEditing={isEditing}
          editForm={editForm}
          onChange={(k, v) => setEditForm((p) => ({ ...p, [k]: v }))}
          savingInfo={savingInfo}
          onSave={handleSaveEdit}
          onCancel={() => setIsEditing(false)}
        />

        <div className="space-y-4">
          <DocumentsCard
            customer={customer}
            stagedFront={stagedFront}
            stagedBack={stagedBack}
            uploadingIdPhotos={uploadingIdPhotos}
            uploadingProfilePhoto={uploadingProfilePhoto}
            deletingFront={deletingFront}
            deletingBack={deletingBack}
            deletingProfile={deletingProfile}
            onView={setPhotoModal}
            onFrontSelect={setStagedFront}
            onFrontClear={() => setStagedFront(null)}
            onBackSelect={setStagedBack}
            onBackClear={() => setStagedBack(null)}
            onIdPhotosUpload={handleIdPhotosUpload}
            onProfilePhotoUpload={handleProfilePhotoUpload}
            onFrontDelete={handleDeleteIdFront}
            onBackDelete={handleDeleteIdBack}
            onProfileDelete={handleDeleteProfilePhoto}
          />
          <BookingHistory bookings={bookings} />
        </div>
      </div>
    </div>
  );
}
