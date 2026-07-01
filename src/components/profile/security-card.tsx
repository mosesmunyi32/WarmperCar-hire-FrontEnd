"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/authServices";
import useAuthStore from "@/store/authStore";
import { cn } from "@/lib/utils";
import { SectionCard } from "./field-helpers";

export function SecurityCard() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) {
      setPwError("New passwords do not match.");
      return;
    }
    if (pwForm.next.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    setPwSaving(true);
    setPwError(null);
    try {
      await authService.requestPasswordChange({
        oldPassword: pwForm.current,
        newPassword: pwForm.next,
      });
      setPwSuccess(true);
      setTimeout(() => {
        logout();
        router.push("/login");
      }, 2000);
    } catch {
      setPwError(
        "Failed to change password. Check your current password and try again.",
      );
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {pwSuccess && (
        <div className="flex items-center gap-3 bg-success/10 border border-success/20 text-success text-sm rounded-xl px-4 py-3">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Password changed successfully. Your account is now secured with the new password.
        </div>
      )}

      <SectionCard title="Password" icon={Lock}>
        {!showPw ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-navy">Change Password</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Update regularly to keep your account secure.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setShowPw(true); setPwError(null); }}
              className="border-navy text-navy hover:bg-navy hover:text-white gap-1.5 shrink-0"
            >
              <Lock className="h-3.5 w-3.5" /> Change Password
            </Button>
          </div>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            {pwError && (
              <div className="flex items-center gap-2 bg-danger/10 border border-danger/20 text-danger text-xs rounded-lg px-3 py-2">
                <XCircle className="h-3.5 w-3.5 shrink-0" /> {pwError}
              </div>
            )}

            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Current Password
              </label>
              <div className="relative">
                <Input
                  type={showCurrent ? "text" : "password"}
                  value={pwForm.current}
                  onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))}
                  placeholder="Enter current password"
                  className="h-10 pr-10 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showNext ? "text" : "password"}
                  value={pwForm.next}
                  onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))}
                  placeholder="Minimum 8 characters"
                  className="h-10 pr-10 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNext((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy"
                >
                  {showNext ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Confirm New Password
              </label>
              <Input
                type="password"
                value={pwForm.confirm}
                onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                placeholder="Re-enter new password"
                className={cn(
                  "h-10 text-sm",
                  pwForm.confirm &&
                    pwForm.confirm !== pwForm.next &&
                    "border-danger focus:ring-danger",
                )}
                required
              />
              {pwForm.confirm && pwForm.confirm !== pwForm.next && (
                <p className="text-xs text-danger mt-1">Passwords do not match.</p>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                type="submit"
                disabled={pwSaving}
                className="bg-navy hover:bg-royal gap-1.5"
                size="sm"
              >
                <Lock className="h-3.5 w-3.5" />
                {pwSaving ? "Saving..." : "Update Password"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowPw(false);
                  setPwForm({ current: "", next: "", confirm: "" });
                  setPwError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </SectionCard>
    </div>
  );
}
