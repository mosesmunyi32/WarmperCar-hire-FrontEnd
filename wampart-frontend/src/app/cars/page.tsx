"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Car, Search, Fuel, Settings2, Users, XCircle } from "lucide-react";
import { CustomerLayout } from "@/components/customer-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { carService } from "@/services/carServices";
import { Car as CarType } from "@/types";

export default function CarsPage() {
  const [cars, setCars] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [fuelFilter, setFuelFilter] = useState("All");
  const [transFilter, setTransFilter] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [passengersFilter, setPassengersFilter] = useState("Any");

  useEffect(() => {
    carService
      .getAllAvailableCars()
      .then(setCars)
      .catch(() => setError("Failed to load cars. Please refresh."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = cars.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = `${c.brand} ${c.model}`.toLowerCase().includes(q);
    const matchFuel =
      fuelFilter === "All" ||
      c.typeOfFuel.toUpperCase() === fuelFilter.toUpperCase();
    const matchTrans =
      transFilter === "All" ||
      c.transmission.toUpperCase() === transFilter.toUpperCase();
    const matchMinPrice = !minPrice || c.pricePerDay >= Number(minPrice);
    const matchMaxPrice = !maxPrice || c.pricePerDay <= Number(maxPrice);
    const matchPassengers =
      passengersFilter === "Any" ||
      c.numberOfPassengers >= Number(passengersFilter);
    return (
      matchSearch &&
      matchFuel &&
      matchTrans &&
      matchMinPrice &&
      matchMaxPrice &&
      matchPassengers
    );
  });

  return (
    <CustomerLayout breadcrumbs={[{ label: "Browse Cars" }]}>
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy">Available Cars</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {loading
              ? "Loading..."
              : `Showing ${filtered.length} car${filtered.length !== 1 ? "s" : ""} available for hire`}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3 mb-4">
            <XCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Filter bar */}
        <div className="bg-white rounded-xl border border-light-gray p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by brand or model..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10"
              />
            </div>

            {/* Fuel */}
            <select
              value={fuelFilter}
              onChange={(e) => setFuelFilter(e.target.value)}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {["All", "PETROL", "DIESEL", "ELECTRIC", "HYBRID"].map((f) => (
                <option key={f} value={f}>
                  {f === "All"
                    ? "All Fuel Types"
                    : f.charAt(0) + f.slice(1).toLowerCase()}
                </option>
              ))}
            </select>

            {/* Transmission */}
            <select
              value={transFilter}
              onChange={(e) => setTransFilter(e.target.value)}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {["All", "AUTOMATIC", "MANUAL"].map((t) => (
                <option key={t} value={t}>
                  {t === "All"
                    ? "All Transmissions"
                    : t.charAt(0) + t.slice(1).toLowerCase()}
                </option>
              ))}
            </select>

            {/* Passengers */}
            <select
              value={passengersFilter}
              onChange={(e) => setPassengersFilter(e.target.value)}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Any">Any Passengers</option>
              <option value="2">2+ seats</option>
              <option value="4">4+ seats</option>
              <option value="5">5+ seats</option>
              <option value="7">7+ seats</option>
            </select>

            {/* Price range */}
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                placeholder="Min price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="h-10 w-28 text-sm"
                min={0}
              />
              <span className="text-muted-foreground text-sm">–</span>
              <Input
                type="number"
                placeholder="Max price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="h-10 w-28 text-sm"
                min={0}
              />
            </div>

            {/* Clear */}
            {(search ||
              fuelFilter !== "All" ||
              transFilter !== "All" ||
              minPrice ||
              maxPrice ||
              passengersFilter !== "Any") && (
              <Button
                variant="outline"
                size="sm"
                className="h-10 gap-1.5 text-danger border-danger/30 hover:bg-danger/5"
                onClick={() => {
                  setSearch("");
                  setFuelFilter("All");
                  setTransFilter("All");
                  setMinPrice("");
                  setMaxPrice("");
                  setPassengersFilter("Any");
                }}
              >
                <XCircle className="h-3.5 w-3.5" /> Clear
              </Button>
            )}
          </div>
        </div>

        {/* Car grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading
            ? [0, 1, 2, 3, 4, 5].map((i) => <CardSkeleton key={i} />)
            : filtered.map((car) => (
                <div
                  key={car.id}
                  className="bg-white rounded-xl border border-light-gray overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="relative bg-off-white h-48 flex items-center justify-center">
                    <Car className="h-20 w-20 text-navy/15 group-hover:text-royal/25 transition-colors" />
                    <span
                      className={`absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full ${
                        car.isAvailable
                          ? "bg-success text-white"
                          : "bg-muted-foreground text-white"
                      }`}
                    >
                      {car.isAvailable ? "Available" : "Booked"}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-navy">
                      {car.brand} {car.model}
                    </h3>
                    <p className="text-muted-foreground text-xs mb-3">
                      {car.yearOfManufacture}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Fuel className="h-3.5 w-3.5" />
                        {car.typeOfFuel}
                      </span>
                      <span className="flex items-center gap-1">
                        <Settings2 className="h-3.5 w-3.5" />
                        {car.transmission}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {car.numberOfPassengers} seats
                      </span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-royal font-bold text-lg">
                          KES {car.pricePerDay.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {" "}
                          /day
                        </span>
                      </div>
                      <Link href={`/cars/${car.id}`}>
                        <Button
                          size="sm"
                          disabled={!car.isAvailable}
                          className="bg-navy hover:bg-royal text-white"
                        >
                          View & Book
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Car className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No cars match your filters</p>
            <p className="text-sm mt-1">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-light-gray overflow-hidden animate-pulse">
      <div className="h-48 bg-light-gray" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-32 bg-light-gray rounded" />
        <div className="h-3 w-16 bg-light-gray rounded" />
        <div className="flex gap-3">
          <div className="h-3 w-14 bg-light-gray rounded" />
          <div className="h-3 w-16 bg-light-gray rounded" />
          <div className="h-3 w-12 bg-light-gray rounded" />
        </div>
        <div className="flex justify-between items-end pt-1">
          <div className="h-6 w-24 bg-light-gray rounded" />
          <div className="h-8 w-20 bg-light-gray rounded" />
        </div>
      </div>
    </div>
  );
}
