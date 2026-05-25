"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Car, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAuthStore from "@/store/authStore";
import { authService } from "@/services/authServices";
import { profileService } from "@/services/profileService";
import { getRoleFromToken } from "@/lib/jwt";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const schema = z.object({
  identifier: z.string().min(1, "Please enter your email or ID number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormData = z.infer<typeof schema>;

// ─── Word-cursor hook ─────────────────────────────────────────────────────────
function useWordCursor(words: string[], wordDelay = 520, holdDelay = 2400) {
  const [count, setCount] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (count < words.length) {
      const t = setTimeout(() => setCount((c) => c + 1), wordDelay);
      return () => clearTimeout(t);
    }
    const hold = setTimeout(() => {
      setFading(true);
      const reset = setTimeout(() => {
        setCount(0);
        setFading(false);
      }, 450);
      return () => clearTimeout(reset);
    }, holdDelay);
    return () => clearTimeout(hold);
  }, [count, words.length, wordDelay, holdDelay]);

  return { shown: words.slice(0, count), fading };
}

export default function LoginPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);

  const { shown, fading } = useWordCursor(
    ["Hire", "cars", "with", "us"],
    500,
    2500,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { identifier: "", password: "" },
  });

  async function onSubmit(values: FormData) {
    try {
      const id = values.identifier.trim();
      const payload = id.includes("@")
        ? { email: id, password: values.password }
        : { idNumber: id, password: values.password };
      const response = await authService.login(payload);
      setToken(response.token);

      const springRole = getRoleFromToken(response.token) ?? response.role;
      const role = springRole?.startsWith("ROLE_")
        ? springRole.replace("ROLE_", "")
        : (springRole ?? "CUSTOMER");

      setUser({
        id: response.id,
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
        role,
        isVerified: response.isVerified,
        isActive: response.isActive,
        phoneNumber: null,
        alternativePhoneNumber: null,
        dateOfBirth: null,
        gender: null,
        county: null,
        city: null,
        idNumber: null,
        profilePhoto: null,
        idFrontPhoto: null,
        idBackPhoto: null,
        driversLicenceNumber: null,
        createdAt: null,
        updatedAt: null,
      });

      if (role === "SUPER_ADMIN") router.push("/super-admin/dashboard");
      else if (role === "ADMIN") router.push("/admin/dashboard");
      else router.push("/dashboard");

      profileService
        .getMyProfile(response.id)
        .then((p) => setUser({ ...p, role: p.role ?? role }))
        .catch(() => {});
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(message ?? "Login failed. Please try again.");
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 py-10">
      {/* ── Background — Warmpart car image ── */}
      <div className="absolute inset-0">
        <Image
          src="/Warmpart car background.jpg"
          fill
          alt=""
          className="object-cover object-center scale-105 blur-sm"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-black/90" />
        {/* Side darkening for focus */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
      </div>

      {/* ── Two-column layout ── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center lg:items-center gap-8 lg:gap-24 px-6">
        {/* ── LEFT — Logo + taglines ── */}
        <div className="flex-1 flex flex-col items-start fade-in-left">
          {/* Car icon */}
          <div className="h-16 w-16 bg-gold/15 rounded-2xl flex items-center justify-center border border-gold/30 shadow-xl shadow-gold/10 mb-6">
            <Car className="h-8 w-8 text-gold" />
          </div>

          {/* Brand name — very large */}
          <h1 className="text-7xl xl:text-8xl font-black tracking-wide leading-none mb-3">
            <span className="text-white">Warm</span>
            <span className="text-gold">part</span>
          </h1>

          <p className="text-white/55 text-xs tracking-[0.35em] uppercase mb-10">
            Premium Car Hire · Kenya
          </p>

          {/* Word-cursor tagline */}
          <div
            className="min-h-12 flex items-center transition-opacity duration-400 mb-10"
            style={{ opacity: fading ? 0 : 1 }}
          >
            <p className="text-3xl xl:text-4xl font-semibold text-white/90 tracking-tight">
              {shown.map((word, i) => (
                <span
                  key={`${word}-${i}`}
                  className="inline-block mr-2.5"
                  style={{ animation: "fadeInWord 0.35s ease-out both" }}
                >
                  {word}
                </span>
              ))}
              <span className="inline-block w-[3px] h-[0.9em] bg-gold align-middle ml-0.5 cursor-blink rounded-sm" />
            </p>
          </div>

          {/* Perspective road-line decoration */}
          <div className="flex items-end gap-1.5">
            {[4, 7, 12, 18, 26, 34, 42, 34, 26, 18, 12, 7, 4].map((h, i) => (
              <div
                key={i}
                className="w-0.5 rounded-full"
                style={{
                  height: `${h}px`,
                  background: `rgba(245,158,11,${0.08 + i * 0.03})`,
                }}
              />
            ))}
          </div>
        </div>

        {/* ── RIGHT — Glass login card ── */}
        <div className="w-full max-w-md shrink-0 fade-in-right flex flex-col gap-5">
          <div className="backdrop-blur-2xl bg-white/[0.07] border border-white/[0.12] rounded-3xl p-8 shadow-2xl shadow-black/50">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-white">Welcome back</h2>
              <p className="text-white/65 text-sm mt-1">
                Sign in to continue your journey
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email or ID Number */}
              <div>
                <label className="block text-[10px] font-semibold text-white/70 tracking-[0.2em] uppercase mb-2">
                  Email or ID Number
                </label>
                <Input
                  type="text"
                  placeholder="Email address or national ID"
                  autoComplete="username"
                  className="h-11 bg-white/[0.06] border-white/[0.13] text-white placeholder:text-white/20 focus-visible:ring-gold/25 focus-visible:border-gold/45 rounded-xl"
                  {...register("identifier")}
                />
                {errors.identifier && (
                  <p className="text-danger text-xs mt-1.5">
                    {errors.identifier.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-semibold text-white/70 tracking-[0.2em] uppercase mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    className="h-11 bg-white/[0.06] border-white/[0.13] text-white placeholder:text-white/20 focus-visible:ring-gold/25 focus-visible:border-gold/45 rounded-xl pr-10"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/55 transition-colors"
                  >
                    {showPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-danger text-xs mt-1.5">
                    {errors.password.message}
                  </p>
                )}
                <div className="flex justify-end mt-1.5">
                  <Link
                    href="/forgot-password"
                    className="text-xs text-gold hover:text-gold/75 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gold text-navy hover:bg-gold/90 font-bold h-11 gap-2 rounded-xl shadow-lg shadow-gold/20"
              >
                {isSubmitting ? "Signing in…" : "Sign In"}
                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
              </Button>

              <p className="text-center text-sm text-white/50 pt-1">
                No account yet?{" "}
                <Link
                  href="/register"
                  className="text-gold hover:text-gold/80 font-semibold transition-colors"
                >
                  Register →
                </Link>
              </p>
            </form>
          </div>

          <p className="text-center text-white/40 text-xs tracking-widest uppercase">
            Secure · Encrypted · Trusted
          </p>
        </div>
      </div>
    </div>
  );
}
