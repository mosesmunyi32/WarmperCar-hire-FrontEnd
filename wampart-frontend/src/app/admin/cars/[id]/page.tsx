"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PencilLine, Images, Trash2, AlertTriangle, Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { carService } from "@/services/carServices";
import { AdminCar } from "@/types";
import { CarBasicInfoCard } from "@/components/admin/cars/car-basic-info-card";
import { CarAdminDetailsCard } from "@/components/admin/cars/car-admin-details-card";
import { CarImagesCard } from "@/components/admin/cars/car-images-card";
import useAuthStore from "@/store/authStore";
import { useRouter } from "next/navigation";

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
  const [tab, setTab] = useState<"details" | "photos">("details");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    carService
      .getAdminCarById(id)
      .then((c) => {
        setCar(c);
        setForm(carToForm(c));
      })
      .catch(() => toast.error("Failed to load car details."))
      .finally(() => setLoading(false));
  }, [id]);

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
          <h1 className="text-2xl font-bold text-navy">
            {car.brand} {car.model}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {car.numberPlate} · {car.color} · {car.yearOfManufacture}
          </p>
        </div>
        <div className="flex items-center gap-3">
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
            onClick={() => setTab("details")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === "details"
                ? "bg-navy text-white"
                : "text-muted-foreground hover:text-navy"
            }`}
          >
            <PencilLine className="h-3.5 w-3.5" /> Car Details
          </button>
          <button
            type="button"
            onClick={() => setTab("photos")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === "photos"
                ? "bg-navy text-white"
                : "text-muted-foreground hover:text-navy"
            }`}
          >
            <Images className="h-3.5 w-3.5" /> Photos
            {(car.images?.length ?? 0) > 0 && (
              <span
                className={`text-xs rounded-full px-1.5 ${tab === "photos" ? "bg-white/20" : "bg-navy/10"}`}
              >
                {car.images!.length}
              </span>
            )}
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
    </div>
  );
}
