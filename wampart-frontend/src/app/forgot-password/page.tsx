"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Car, ArrowRight, ArrowLeft, Eye, EyeOff, KeyRound, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/authServices";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "reset">("email");

  const [email, setEmail] = useState("");
  const [submittingEmail, setSubmittingEmail] = useState(false);

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submittingReset, setSubmittingReset] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmittingEmail(true);
    try {
      await authService.forgotPassword({ email });
      toast.success("OTP sent to your email.");
      setStep("reset");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? "Could not send OTP. Please check the email address.");
    } finally {
      setSubmittingEmail(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
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
      await authService.resetPassword({ email, otp, newPassword });
      toast.success("Password reset successfully. Please sign in.");
      router.push("/login");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? "Failed to reset password. Check your OTP and try again.");
    } finally {
      setSubmittingReset(false);
    }
  };

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
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="backdrop-blur-2xl bg-white/[0.07] border border-white/[0.12] rounded-3xl p-8 shadow-2xl shadow-black/50">

          {/* Icon + title */}
          <div className="flex flex-col items-center mb-7 text-center">
            <div className="h-14 w-14 bg-gold/15 rounded-2xl flex items-center justify-center border border-gold/30 shadow-xl shadow-gold/10 mb-4">
              {step === "email" ? (
                <Mail className="h-7 w-7 text-gold" />
              ) : (
                <KeyRound className="h-7 w-7 text-gold" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white">
              {step === "email" ? "Forgot password?" : "Reset password"}
            </h2>
            <p className="text-white/35 text-sm mt-1">
              {step === "email"
                ? "Enter your email and we'll send you a one-time code."
                : `Enter the OTP sent to ${email}`}
            </p>
          </div>

          {/* ── Step 1: Email ── */}
          {step === "email" && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-[10px] font-semibold text-white/40 tracking-[0.2em] uppercase mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 bg-white/[0.06] border-white/[0.13] text-white placeholder:text-white/20 focus-visible:ring-gold/25 focus-visible:border-gold/45 rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={submittingEmail}
                className="w-full bg-gold text-navy hover:bg-gold/90 font-bold h-11 gap-2 rounded-xl shadow-lg shadow-gold/20"
              >
                {submittingEmail ? "Sending…" : "Send OTP"}
                {!submittingEmail && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>
          )}

          {/* ── Step 2: OTP + new password ── */}
          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-[10px] font-semibold text-white/40 tracking-[0.2em] uppercase mb-2">
                  OTP Code
                </label>
                <Input
                  type="text"
                  placeholder="Enter the code from your email"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="h-11 bg-white/[0.06] border-white/[0.13] text-white placeholder:text-white/20 focus-visible:ring-gold/25 focus-visible:border-gold/45 rounded-xl tracking-widest"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-white/40 tracking-[0.2em] uppercase mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="h-11 bg-white/[0.06] border-white/[0.13] text-white placeholder:text-white/20 focus-visible:ring-gold/25 focus-visible:border-gold/45 rounded-xl pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/55 transition-colors"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-white/40 tracking-[0.2em] uppercase mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-11 bg-white/[0.06] border-white/[0.13] text-white placeholder:text-white/20 focus-visible:ring-gold/25 focus-visible:border-gold/45 rounded-xl pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/55 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("email")}
                  className="h-11 border-white/20 text-white/60 hover:bg-white/10 hover:text-white rounded-xl gap-2"
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
              className="text-white/30 hover:text-white/60 text-sm transition-colors inline-flex items-center gap-1.5"
            >
              <Car className="h-3.5 w-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
