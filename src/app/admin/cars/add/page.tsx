"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { carService } from "@/services/carServices";

function formatNumberPlate(raw: string): string {
  const clean = raw.replace(/\s+/g, "").toUpperCase();
  return clean.length <= 3 ? clean : `${clean.slice(0, 3)} ${clean.slice(3)}`;
}

export default function AddCarPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [form, setForm] = useState({
    brand: "",
    model: "",
    yearOfManufacture: "",
    color: "",
    typeOfFuel: "",
    transmission: "",
    numberOfPassengers: "",
    numberPlate: "",
    description: "",
    pricePerDay: "",
    currentMileage: "",
    serviceMileageInterval: "",
    insuranceExpirationDate: "",
  });

  const set = (k: string, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleImageSelect = (files: FileList) => {
    const newFiles = Array.from(files);
    setSelectedImages((prev) => [...prev, ...newFiles]);
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) =>
        setImagePreviews((prev) => [...prev, e.target?.result as string]);
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const newCar = await carService.addCar({
        brand: form.brand,
        model: form.model,
        yearOfManufacture: Number(form.yearOfManufacture),
        color: form.color,
        typeOfFuel: form.typeOfFuel,
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

      if (selectedImages.length > 0) {
        const formData = new FormData();
        selectedImages.forEach((f) => formData.append("files", f));
        await carService.uploadCarImages(newCar.id, formData);
      }

      router.push("/admin/cars");
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(message ?? "Failed to add car.");
    } finally {
      setIsLoading(false);
    }
  };

  const field = (
    label: string,
    key: string,
    type = "text",
    placeholder = "",
  ) => (
    <div key={key}>
      <label className="block text-sm font-medium text-navy mb-1.5">
        {label}
      </label>
      <Input
        type={type}
        placeholder={placeholder}
        value={(form as Record<string, string>)[key]}
        onChange={(e) => set(key, e.target.value)}
        className="h-10"
        required
      />
    </div>
  );

  return (
    <div>
      <Link
        href="/admin/cars"
        className="flex items-center gap-2 text-muted-foreground hover:text-navy text-sm mb-6 w-fit"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Cars
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">Add New Car</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Fill in the vehicle details below
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-2 gap-5 mb-5">
          <div className="bg-white rounded-xl border border-light-gray p-5 shadow-sm">
            <h2 className="font-semibold text-navy text-sm mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {field("Brand", "brand", "text", "e.g. Toyota")}
              {field("Model", "model", "text", "e.g. Corolla")}
              {field("Year", "yearOfManufacture", "number", "2023")}
              {field("Color", "color", "text", "White")}
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">
                  Fuel Type
                </label>
                <select
                  value={form.typeOfFuel}
                  onChange={(e) => set("typeOfFuel", e.target.value)}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  <option value="">Select fuel</option>
                  {(["PETROL", "DIESEL", "ELECTRIC", "HYBRID"] as const).map(
                    (f) => (
                      <option key={f} value={f}>
                        {f.charAt(0) + f.slice(1).toLowerCase()}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">
                  Transmission
                </label>
                <select
                  value={form.transmission}
                  onChange={(e) => set("transmission", e.target.value)}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  <option value="">Select</option>
                  <option value="AUTOMATIC">Automatic</option>
                  <option value="MANUAL">Manual</option>
                </select>
              </div>
              {field("No. of Passengers", "numberOfPassengers", "number", "5")}
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">
                  Number Plate
                </label>
                <Input
                  type="text"
                  placeholder="KDJ 760Y"
                  value={form.numberPlate}
                  onChange={(e) =>
                    set("numberPlate", formatNumberPlate(e.target.value))
                  }
                  className="h-10"
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-navy mb-1.5">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Describe the car..."
                rows={3}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                required
              />
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-light-gray p-5 shadow-sm">
              <h2 className="font-semibold text-navy text-sm mb-4">
                Admin Details
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {field("Price Per Day (KES)", "pricePerDay", "number", "3500")}
                {field(
                  "Current Mileage (km)",
                  "currentMileage",
                  "number",
                  "50000",
                )}
                {field(
                  "Service Mileage Interval (km)",
                  "serviceMileageInterval",
                  "number",
                  "10000",
                )}
                {field(
                  "Insurance Expiration Date",
                  "insuranceExpirationDate",
                  "date",
                )}
              </div>
            </div>

            {/* Image upload */}
            <div className="bg-white rounded-xl border border-light-gray p-5 shadow-sm">
              <h2 className="font-semibold text-navy text-sm mb-3 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-royal" /> Car Images
                <span className="text-xs text-muted-foreground font-normal ml-auto">
                  {selectedImages.length} selected
                </span>
              </h2>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) =>
                  e.target.files && handleImageSelect(e.target.files)
                }
              />
              {imagePreviews.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {imagePreviews.map((src, i) => (
                    <div
                      key={i}
                      className="relative group aspect-video rounded-lg overflow-hidden border border-light-gray"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-danger text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <div
                    className="aspect-video rounded-lg border-2 border-dashed border-light-gray flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-royal transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Add more</p>
                  </div>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-light-gray rounded-xl p-6 text-center cursor-pointer hover:border-royal transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-7 w-7 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to add photos
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">
                    Optional — can be added later
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/admin/cars">
            <Button
              variant="outline"
              type="button"
              className="border-navy/20 text-navy"
            >
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-navy hover:bg-royal px-8"
          >
            {isLoading ? "Saving..." : "Add Car"}
          </Button>
        </div>
      </form>
    </div>
  );
}
