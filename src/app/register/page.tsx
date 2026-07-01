"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Car,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { authService } from "@/services/authServices";
import axiosInstance from "@/lib/axios";
import { cn } from "@/lib/utils";
import { RegisterFormData } from "@/types";
import { toast } from "sonner";

const STEPS = ["Personal Info", "Details", "Documents"];

const INITIAL: RegisterFormData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  phoneNumber: "",
  alternativePhoneNumber: "",
  dateOfBirth: "",
  gender: "",
  county: "",
  city: "",
  idNumber: "",
  driversLicenceNumber: "",
};

// Shared light input class
const GI =
  "h-11 bg-white border-light-gray text-navy placeholder:text-muted-foreground/50 focus-visible:ring-royal/25 focus-visible:border-royal/45 rounded-xl";

// Shared label class
const GL =
  "block text-[10px] font-semibold text-navy/70 tracking-[0.2em] uppercase mb-2";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<RegisterFormData>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const set = (field: keyof RegisterFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // Validate the fields for a given step. Only alternativePhoneNumber and
  // driversLicenceNumber are optional — everything else is required.
  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!form.firstName.trim()) e.firstName = "First name is required";
      if (!form.lastName.trim()) e.lastName = "Last name is required";
      if (!form.email.trim()) e.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        e.email = "Enter a valid email address";
      if (!form.password) e.password = "Password is required";
      else if (form.password.length < 6)
        e.password = "Password must be at least 6 characters";
      if (!form.confirmPassword)
        e.confirmPassword = "Please confirm your password";
      else if (form.password !== form.confirmPassword)
        e.confirmPassword = "Passwords do not match";
      if (!form.phoneNumber.trim()) e.phoneNumber = "Phone number is required";
    } else if (s === 1) {
      if (!form.dateOfBirth) e.dateOfBirth = "Date of birth is required";
      if (!form.gender) e.gender = "Please select your gender";
      if (!form.county.trim()) e.county = "County is required";
      if (!form.city.trim()) e.city = "City / town is required";
    } else if (s === 2) {
      if (!form.idNumber.trim()) e.idNumber = "National ID number is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;
    setIsLoading(true);
    try {
      const response = await authService.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phoneNumber: form.phoneNumber,
        alternativePhoneNumber: form.alternativePhoneNumber,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        county: form.county,
        city: form.city,
        idNumber: form.idNumber,
        driversLicenceNumber: form.driversLicenceNumber || undefined,
      });

      // The backend's /auth/register DTO may not map extra profile fields
      // (phoneNumber, alternativePhoneNumber, county, city). Save them
      // immediately via the profile endpoint using the registration token.
      if (response?.id && response?.token) {
        await axiosInstance
          .patch(
            `/users/profile/${response.id}`,
            {
              phoneNumber: form.phoneNumber || undefined,
              alternativePhoneNumber: form.alternativePhoneNumber || undefined,
              dateOfBirth: form.dateOfBirth || undefined,
              gender: form.gender || undefined,
              county: form.county || undefined,
              city: form.city || undefined,
              driversLicenceNumber: form.driversLicenceNumber || undefined,
            },
            { headers: { Authorization: `Bearer ${response.token}` } },
          )
          .catch(() => {});
      }

      toast.success("Registration successful! Redirecting to login…", {
        duration: 3000,
      });
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(message ?? "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden py-10 px-4">
      {/* ── White frosted background ── */}
      <div className="absolute inset-0">
        <Image
          src="/Image.png"
          fill
          alt=""
          className="object-cover object-center scale-110 blur-2xl"
          priority
        />
        <div className="absolute inset-0 bg-white/80 backdrop-blur-2xl" />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-royal/10 blur-3xl" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col lg:flex-row gap-14 items-start">
        {/* Left: brand + benefits (desktop) */}
        <div className="hidden lg:flex flex-col w-72 shrink-0 pt-4 fade-in-left">
          <Link href="/" className="flex items-center gap-3 mb-14">
            <div className="h-10 w-10 bg-gold/15 rounded-xl flex items-center justify-center border border-gold/30">
              <Car className="h-5 w-5 text-gold" />
            </div>
            <div>
              <span className="text-navy font-black text-2xl tracking-wide">
                Warm<span className="text-gold">pert</span>
              </span>
              <p className="text-muted-foreground text-[10px] tracking-[0.25em] uppercase -mt-0.5">
                Car Hire
              </p>
            </div>
          </Link>

          <h2 className="text-4xl font-black text-navy leading-tight mb-4">
            Join the
            <br />
            <span className="text-gold">Journey.</span>
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-10">
            Create your account and unlock access to our premium fleet. Your
            adventure is just a few steps away.
          </p>

          <div className="space-y-3 mb-10">
            {[
              "Free to register",
              "Instant booking confirmation",
              "Manage everything online",
              "Flexible rental periods",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-3 w-3 text-success" />
                </div>
                <span className="text-navy/70 text-sm">{f}</span>
              </div>
            ))}
          </div>

          {/* Perspective lines */}
          <div className="flex items-end gap-1.5">
            {[4, 7, 12, 18, 26, 34, 26, 18, 12, 7, 4].map((h, i) => (
              <div
                key={i}
                className="w-0.5 rounded-full"
                style={{
                  height: `${h}px`,
                  background: `rgba(245,158,11,${0.15 + i * 0.04})`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Right: form card */}
        <div className="flex-1 fade-in-right">
          {/* Mobile logo */}
          <Link
            href="/"
            className="flex lg:hidden items-center gap-3 mb-6 justify-center"
          >
            <Car className="h-6 w-6 text-gold" />
            <span className="text-navy font-black text-xl tracking-wide">
              Warm<span className="text-gold">pert</span>
            </span>
          </Link>

          <div className="bg-white border border-light-gray rounded-3xl p-8 shadow-2xl shadow-navy/10">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-navy">Create Account</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Join Warmpert — it&apos;s free
              </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-7">
              {STEPS.map((label, i) => (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div
                    className={cn(
                      "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                      i < step
                        ? "bg-success text-white"
                        : i === step
                          ? "bg-gold text-navy"
                          : "bg-light-gray text-muted-foreground",
                    )}
                  >
                    {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      "text-xs hidden sm:block transition-colors",
                      i === step
                        ? "text-navy font-semibold"
                        : "text-muted-foreground",
                    )}
                  >
                    {label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-px mx-1 transition-colors",
                        i < step ? "bg-success/50" : "bg-light-gray",
                      )}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* ── Step 1: Personal Info ── */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={GL}>First Name</label>
                    <Input
                      placeholder="John"
                      value={form.firstName}
                      onChange={(e) => set("firstName", e.target.value)}
                      className={cn(GI, errors.firstName && "border-danger/60")}
                    />
                    {errors.firstName && (
                      <p className="text-danger text-xs mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={GL}>Last Name</label>
                    <Input
                      placeholder="Doe"
                      value={form.lastName}
                      onChange={(e) => set("lastName", e.target.value)}
                      className={cn(GI, errors.lastName && "border-danger/60")}
                    />
                    {errors.lastName && (
                      <p className="text-danger text-xs mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className={GL}>Email Address</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    className={cn(GI, errors.email && "border-danger/60")}
                  />
                  {errors.email && (
                    <p className="text-danger text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className={GL}>Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      className={cn(
                        GI,
                        "pr-10",
                        errors.password && "border-danger/60",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-danger text-xs mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className={GL}>Confirm Password</label>
                  <div className="relative">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.confirmPassword}
                      onChange={(e) => set("confirmPassword", e.target.value)}
                      className={cn(
                        GI,
                        "pr-10",
                        errors.confirmPassword && "border-danger/60",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy transition-colors"
                    >
                      {showConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-danger text-xs mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className={GL}>Phone Number</label>
                  <Input
                    type="tel"
                    placeholder="0712 345 678"
                    value={form.phoneNumber}
                    onChange={(e) => set("phoneNumber", e.target.value)}
                    className={cn(GI, errors.phoneNumber && "border-danger/60")}
                  />
                  {errors.phoneNumber && (
                    <p className="text-danger text-xs mt-1">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className={GL}>
                    Alternative Phone Number{" "}
                    <span className="text-muted-foreground normal-case tracking-normal font-normal">
                      (Optional — emergency contact)
                    </span>
                  </label>
                  <Input
                    type="tel"
                    placeholder="0712 345 678"
                    value={form.alternativePhoneNumber}
                    onChange={(e) =>
                      set("alternativePhoneNumber", e.target.value)
                    }
                    className={GI}
                  />
                </div>
              </div>
            )}

            {/* ── Step 2: Details ── */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className={GL}>Date of Birth</label>
                  <DatePicker
                    value={form.dateOfBirth}
                    onChange={(v) => set("dateOfBirth", v)}
                    placeholder="Select your date of birth"
                  />
                  {errors.dateOfBirth && (
                    <p className="text-danger text-xs mt-1">
                      {errors.dateOfBirth}
                    </p>
                  )}
                </div>

                <div>
                  <label className={GL}>Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => set("gender", e.target.value)}
                    className={cn(
                      "w-full h-11 rounded-xl border bg-white border-light-gray text-navy px-3 text-sm focus:outline-none focus:ring-1 focus:ring-royal/40 focus:border-royal/45",
                      errors.gender && "border-danger/60",
                    )}
                  >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                  {errors.gender && (
                    <p className="text-danger text-xs mt-1">{errors.gender}</p>
                  )}
                </div>

                <div>
                  <label className={GL}>County</label>
                  <Input
                    placeholder="e.g. Nairobi"
                    value={form.county}
                    onChange={(e) => set("county", e.target.value)}
                    className={cn(GI, errors.county && "border-danger/60")}
                  />
                  {errors.county && (
                    <p className="text-danger text-xs mt-1">{errors.county}</p>
                  )}
                </div>

                <div>
                  <label className={GL}>City / Town</label>
                  <Input
                    placeholder="e.g. Westlands"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    className={cn(GI, errors.city && "border-danger/60")}
                  />
                  {errors.city && (
                    <p className="text-danger text-xs mt-1">{errors.city}</p>
                  )}
                </div>
              </div>
            )}

            {/* ── Step 3: Documents ── */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className={GL}>National ID Number</label>
                  <Input
                    placeholder="Enter your ID number"
                    value={form.idNumber}
                    onChange={(e) => set("idNumber", e.target.value)}
                    className={cn(GI, errors.idNumber && "border-danger/60")}
                  />
                  {errors.idNumber && (
                    <p className="text-danger text-xs mt-1">{errors.idNumber}</p>
                  )}
                </div>
                <div>
                  <label className={GL}>
                    Driver&apos;s Licence Number{" "}
                    <span className="text-muted-foreground normal-case tracking-normal font-normal">
                      (Optional)
                    </span>
                  </label>
                  <Input
                    placeholder="Enter licence number"
                    value={form.driversLicenceNumber}
                    onChange={(e) =>
                      set("driversLicenceNumber", e.target.value)
                    }
                    className={GI}
                  />
                </div>
                <div className="bg-off-white border border-light-gray rounded-xl p-3 text-xs text-muted-foreground">
                  Your documents are kept secure and used only for identity
                  verification.
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-7">
              {step > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep((s) => s - 1)}
                  className="flex-1 h-11 border-light-gray text-navy hover:bg-off-white gap-2 rounded-xl bg-white"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 h-11 bg-gold text-navy hover:bg-gold/90 font-bold gap-2 rounded-xl shadow-lg shadow-gold/20"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 h-11 bg-gold text-navy hover:bg-gold/90 font-bold gap-2 rounded-xl shadow-lg shadow-gold/20"
                >
                  {isLoading ? (
                    "Creating Account…"
                  ) : (
                    <>
                      Create Account <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>

            <p className="text-center text-sm text-muted-foreground mt-5">
              Already registered?{" "}
              <Link
                href="/login"
                className="text-gold hover:text-gold/80 font-semibold transition-colors"
              >
                Sign In →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
