"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Car, AlertTriangle, CheckCircle2, Loader2, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { carService } from "@/services/carServices";
import { AdminCar } from "@/types";
import { differenceInDays } from "date-fns";
import useAuthStore from "@/store/authStore";

function serviceRemaining(car: AdminCar): number {
  if (!car.serviceMileageInterval || car.serviceMileageInterval === 0) return 0;
  const nextService =
    Math.ceil(car.currentMileage / car.serviceMileageInterval) *
    car.serviceMileageInterval;
  return nextService - car.currentMileage;
}

function insuranceDaysLeft(car: AdminCar): number | null {
  if (!car.insuranceExpiryDate) return null;
  return differenceInDays(new Date(car.insuranceExpiryDate), new Date());
}

function InsuranceBadge({ days }: { days: number | null }) {
  if (days === null)
    return <span className="text-xs text-muted-foreground italic">N/A</span>;
  if (days < 0)
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-danger">
        <AlertTriangle className="h-3 w-3" />
        Expired
      </span>
    );
  if (days <= 30)
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-warning">
        <AlertTriangle className="h-3 w-3" />
        {days}d left
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-xs text-success">
      <CheckCircle2 className="h-3 w-3" />
      {days}d left
    </span>
  );
}

function ServiceBadge({ km }: { km: number }) {
  if (km <= 0)
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-danger">
        <AlertTriangle className="h-3 w-3" />
        Overdue
      </span>
    );
  if (km <= 2000)
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-warning">
        <AlertTriangle className="h-3 w-3" />
        {km.toLocaleString()} km
      </span>
    );
  return <span className="text-xs text-success">{km.toLocaleString()} km</span>;
}

function TableSkeleton() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <tr key={i} className="border-b border-light-gray animate-pulse">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-3.5 bg-light-gray rounded w-20" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function AdminCarsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const [cars, setCars] = useState<AdminCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<{ id: string; action: "enabling" | "disabling" } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  type FilterKey = "available" | "unavailable" | "insurance-expiring" | "service-overdue" | "approaching-service";
  const initialFilter = (searchParams.get("filter") as FilterKey | null) ?? null;
  const [activeFilter, setActiveFilter] = useState<FilterKey | null>(initialFilter);

  const filteredCars = (() => {
    if (activeFilter === "available") return cars.filter((c) => c.isAvailable);
    if (activeFilter === "unavailable") return cars.filter((c) => !c.isAvailable);
    if (activeFilter === "insurance-expiring")
      return cars.filter((c) => { const d = insuranceDaysLeft(c); return d !== null && d <= 30; });
    if (activeFilter === "service-overdue") return cars.filter((c) => serviceRemaining(c) <= 0);
    if (activeFilter === "approaching-service")
      return cars.filter((c) => { const km = serviceRemaining(c); return km > 0 && km <= 500; });
    return cars;
  })();

  useEffect(() => {
    carService
      .getAllCarsForAdmin()
      .then(setCars)
      .catch(() => toast.error("Failed to load cars. Please refresh."))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleAvailability = async (car: AdminCar) => {
    setToggling({ id: car.id, action: car.isAvailable ? "disabling" : "enabling" });
    try {
      const result = await carService.toggleAvailability(car.id);
      setCars((prev) =>
        prev.map((c) =>
          c.id === result.id ? { ...c, isAvailable: result.available } : c,
        ),
      );
    } catch {
      toast.error("Failed to update availability.");
    } finally {
      setToggling(null);
    }
  };

  const handleDeleteCar = async (car: AdminCar) => {
    setDeletingId(car.id);
    try {
      await carService.deleteCar(car.id);
      setCars((prev) => prev.filter((c) => c.id !== car.id));
      toast.success(`${car.brand} ${car.model} deleted.`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg ?? "Failed to delete car.");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">Manage Cars</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {loading ? "Loading..." : `${cars.length} vehicles in fleet`}
          </p>
        </div>
        <Link href="/admin/cars/add">
          <Button className="bg-navy hover:bg-royal gap-2">
            <Plus className="h-4 w-4" /> Add Car
          </Button>
        </Link>
      </div>

      {/* Fleet health summary */}
      {!loading && cars.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
          {(
            [
              {
                label: "Available",
                value: cars.filter((c) => c.isAvailable).length,
                color: "text-success",
                bg: "bg-success/10",
                ring: "ring-2 ring-success/50",
                filter: "available" as FilterKey,
              },
              {
                label: "Unavailable",
                value: cars.filter((c) => !c.isAvailable).length,
                color: "text-danger",
                bg: "bg-danger/10",
                ring: "ring-2 ring-danger/50",
                filter: "unavailable" as FilterKey,
              },
              {
                label: "Insurance Expiring",
                value: cars.filter((c) => {
                  const d = insuranceDaysLeft(c);
                  return d !== null && d <= 30;
                }).length,
                color: "text-warning",
                bg: "bg-warning/10",
                ring: "ring-2 ring-warning/50",
                filter: "insurance-expiring" as FilterKey,
              },
              {
                label: "Service Overdue",
                value: cars.filter((c) => serviceRemaining(c) <= 0).length,
                color: "text-danger",
                bg: "bg-danger/10",
                ring: "ring-2 ring-danger/50",
                filter: "service-overdue" as FilterKey,
              },
              {
                label: "Approaching Service",
                value: cars.filter((c) => { const km = serviceRemaining(c); return km > 0 && km <= 500; }).length,
                color: "text-orange-500",
                bg: "bg-orange-50",
                ring: "ring-2 ring-orange-300",
                filter: "approaching-service" as FilterKey,
              },
            ] satisfies { label: string; value: number; color: string; bg: string; ring: string; filter: FilterKey }[]
          ).map((s) => (
            <button
              key={s.label}
              onClick={() => setActiveFilter(activeFilter === s.filter ? null : s.filter)}
              className={`${s.bg} rounded-xl px-4 py-3 text-left w-full transition-all hover:brightness-95 cursor-pointer ${activeFilter === s.filter ? s.ring : ""}`}
            >
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </button>
          ))}
        </div>
      )}

      {activeFilter && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-muted-foreground">Filtered by:</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-navy/5 text-navy px-2.5 py-1 rounded-full">
            {activeFilter === "available" && "Available"}
            {activeFilter === "unavailable" && "Unavailable"}
            {activeFilter === "insurance-expiring" && "Insurance Expiring"}
            {activeFilter === "service-overdue" && "Service Overdue"}
            {activeFilter === "approaching-service" && "Approaching Service"}
            <button onClick={() => setActiveFilter(null)} className="hover:text-danger transition-colors">
              <X className="h-3 w-3" />
            </button>
          </span>
          <span className="text-xs text-muted-foreground">
            {filteredCars.length} of {cars.length} vehicles
          </span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-light-gray shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-light-gray bg-off-white">
                {[
                  "Car",
                  "Plate",
                  "Fuel / Trans.",
                  "Mileage",
                  "Service Due",
                  "Insurance",
                  "Availability",
                  "Actions",
                ].map((h) => (
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
                <TableSkeleton />
              ) : filteredCars.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-muted-foreground text-sm"
                  >
                    {activeFilter ? "No cars match this filter." : "No cars in fleet."}
                  </td>
                </tr>
              ) : (
                filteredCars.map((car) => {
                  const svcKm = serviceRemaining(car);
                  const insDays = insuranceDaysLeft(car);
                  const busy = toggling?.id === car.id;
                  return (
                    <tr
                      key={car.id}
                      className="hover:bg-off-white transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/cars/${car.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 bg-navy/5 rounded-lg flex items-center justify-center shrink-0">
                            <Car className="h-4 w-4 text-navy" />
                          </div>
                          <div>
                            <p className="font-medium text-navy">
                              {car.brand} {car.model}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {car.yearOfManufacture} · {car.color}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-navy">
                        {car.numberPlate}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {car.typeOfFuel.charAt(0) +
                          car.typeOfFuel.slice(1).toLowerCase()}{" "}
                        /{" "}
                        {car.transmission.charAt(0) +
                          car.transmission.slice(1).toLowerCase()}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {car.currentMileage.toLocaleString()} km
                      </td>
                      <td className="px-4 py-3">
                        <ServiceBadge km={svcKm} />
                      </td>
                      <td className="px-4 py-3">
                        <InsuranceBadge days={insDays} />
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            car.isAvailable
                              ? "bg-success/10 text-success"
                              : "bg-danger/10 text-danger"
                          }`}
                        >
                          {car.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={busy}
                            onClick={() => handleToggleAvailability(car)}
                            className={`h-7 text-xs ${car.isAvailable ? "border-danger/30 text-danger" : "border-success/30 text-success"}`}
                          >
                            {busy ? (
                              <span className="flex items-center gap-1.5">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                {toggling?.action === "enabling" ? "Enabling…" : "Disabling…"}
                              </span>
                            ) : car.isAvailable ? "Disable" : "Enable"}
                          </Button>

                          {isSuperAdmin && (
                            confirmDeleteId === car.id ? (
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  disabled={deletingId === car.id}
                                  onClick={() => handleDeleteCar(car)}
                                  className="h-7 text-xs bg-danger hover:bg-danger/90 text-white px-2"
                                >
                                  {deletingId === car.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : "Confirm"}
                                </Button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="text-muted-foreground hover:text-navy transition-colors p-0.5"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteId(car.id)}
                                className="text-muted-foreground hover:text-danger transition-colors p-1 rounded"
                                title="Delete car"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
