"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Car,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/authServices";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type IdentifierType = "email" | "phone";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"identifier" | "reset">("identifier");
  const [identifierType, setIdentifierType] = useState<IdentifierType>("email");

  const [identifier, setIdentifier] = useState("");
  const [sentIdentifier, setSentIdentifier] = useState("");
  const [submittingIdentifier, setSubmittingIdentifier] = useState(false);

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submittingReset, setSubmittingReset] = useState(false);

  const handleSendOtp = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    setSubmittingIdentifier(true);
    try {
      const payload =
        identifierType === "email"
          ? { email: identifier.trim() }
          : { phoneNumber: identifier.trim() };
      await authService.forgotPassword(payload);
      setSentIdentifier(identifier.trim());
      toast.success(
        identifierType === "email" ? "OTP sent to your email." : "OTP sent to your WhatsApp.",
      );
      setStep("reset");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(
        msg ??
          identifierType === "email"
            ? "Could not send OTP. Please check the email address."
            : "Could not send OTP. Please check the WhatsApp number.",
      );
    } finally {
      setSubmittingIdentifier(false);
    }
  };

  const handleResetPassword = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setSubmittingReset(true);
    try {
      const payload =
        identifierType === "email"
          ? { email: sentIdentifier, otp, newPassword }
          : { phoneNumber: sentIdentifier, otp, newPassword };
      await authService.resetPassword(payload);
      toast.success("Password reset successfully. Please sign in.");
      router.push("/login");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(
        msg ?? "Failed to reset password. Check your OTP and try again.",
      );
    } finally {
      setSubmittingReset(false);
    }
  };

  const maskedIdentifier =
    identifierType === "phone"
      ? sentIdentifier.replace(/(\d{3})\d+(\d{3})/, "$1••••$2") || sentIdentifier
      : sentIdentifier.replace(/(.{2}).+(@.+)/, "$1•••$2") || sentIdentifier;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0">
        <Image
          src="/Warmpart car background.jpg"
          fill
          alt=""
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/50 to-black/85" />
        <div className="absolute inset-0 bg-linear-to-r from-black/40 via-transparent to-black/40" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="backdrop-blur-2xl bg-white/7 border border-white/12 rounded-3xl p-8 shadow-2xl shadow-black/50">
          {/* Icon + title */}
          <div className="flex flex-col items-center mb-7 text-center">
            <div className="h-14 w-14 bg-gold/15 rounded-2xl flex items-center justify-center border border-gold/30 shadow-xl shadow-gold/10 mb-4">
              {step === "identifier" ? (
                identifierType === "email" ? (
                  <Mail className="h-7 w-7 text-gold" />
                ) : (
                  <Phone className="h-7 w-7 text-gold" />
                )
              ) : (
                <KeyRound className="h-7 w-7 text-gold" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white">
              {step === "identifier" ? "Forgot password?" : "Reset password"}
            </h2>
            <p className="text-white/65 text-sm mt-1">
              {step === "identifier"
                ? "Enter your email or WhatsApp number to receive a one-time code."
                : `Enter the OTP sent to ${maskedIdentifier}`}
            </p>
          </div>

          {/* ── Step 1: Email or Phone ── */}
          {step === "identifier" && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              {/* Toggle */}
              <div className="flex rounded-xl border border-white/13 overflow-hidden">
                {(["email", "phone"] as IdentifierType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setIdentifierType(type);
                      setIdentifier("");
                    }}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold transition-colors",
                      identifierType === type
                        ? "bg-gold text-navy"
                        : "bg-white/4 text-white/40 hover:text-white/70 hover:bg-white/8",
                    )}
                  >
                    {type === "email" ? (
                      <>
                        <Mail className="h-3.5 w-3.5" /> Email
                      </>
                    ) : (
                      <>
                        <Phone className="h-3.5 w-3.5" /> WhatsApp
                      </>
                    )}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-white/70 tracking-[0.2em] uppercase mb-2">
                  {identifierType === "email"
                    ? "Email Address"
                    : "WhatsApp Number"}
                </label>
                <Input
                  key={identifierType}
                  type={identifierType === "email" ? "email" : "tel"}
                  placeholder={
                    identifierType === "email"
                      ? "you@example.com"
                      : "07XX XXX XXX"
                  }
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoComplete={identifierType === "email" ? "email" : "tel"}
                  className="h-11 bg-white/6 border-white/13 text-white placeholder:text-white/20 focus-visible:ring-gold/25 focus-visible:border-gold/45 rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={submittingIdentifier}
                className="w-full bg-gold text-navy hover:bg-gold/90 font-bold h-11 gap-2 rounded-xl shadow-lg shadow-gold/20"
              >
                {submittingIdentifier ? "Sending…" : "Send OTP"}
                {!submittingIdentifier && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>
          )}

          {/* ── Step 2: OTP + new password ── */}
          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-[10px] font-semibold text-white/70 tracking-[0.2em] uppercase mb-2">
                  OTP Code
                </label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder={`Code sent to your ${identifierType === "email" ? "email" : "WhatsApp"}`}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="h-11 bg-white/6 border-white/13 text-white placeholder:text-white/20 focus-visible:ring-gold/25 focus-visible:border-gold/45 rounded-xl tracking-widest"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-white/70 tracking-[0.2em] uppercase mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="h-11 bg-white/6 border-white/13 text-white placeholder:text-white/20 focus-visible:ring-gold/25 focus-visible:border-gold/45 rounded-xl pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                  >
                    {showPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-white/70 tracking-[0.2em] uppercase mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-11 bg-white/6 border-white/13 text-white placeholder:text-white/20 focus-visible:ring-gold/25 focus-visible:border-gold/45 rounded-xl pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setStep("identifier")}
                  className="h-11 bg-transparent border border-white/20 text-white/70 hover:bg-white/10 hover:text-white rounded-xl gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button
                  type="submit"
                  disabled={submittingReset}
                  className="flex-1 bg-gold text-navy hover:bg-gold/90 font-bold h-11 gap-2 rounded-xl shadow-lg shadow-gold/20"
                >
                  {submittingReset ? "Resetting…" : "Reset Password"}
                  {!submittingReset && <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-white/55 hover:text-white/80 text-sm transition-colors inline-flex items-center gap-1.5"
            >
              <Car className="h-3.5 w-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
