"use client";

import { useEffect } from "react";
import { CustomerLayout } from "@/components/customer-layout";
import { ProfilePhotoCard } from "@/components/profile/profile-photo-card";
import { ProfileInfoCard } from "@/components/profile/profile-info-card";
import { VerificationCard } from "@/components/profile/verification-card";
import useAuthStore from "@/store/authStore";
import { profileService } from "@/services/profileService";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    if (!user?.id) return;
    profileService
      .getMyProfile(user.id)
      .then((p) => setUser({ ...p, role: p.role ?? user.role }))
      .catch(() => {});
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <CustomerLayout breadcrumbs={[{ label: "My Profile" }]}>
      <div className="mx-auto max-w-3xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-5">
        {/* Read-only header — name, email, account badges */}
        <div className="bg-white rounded-xl border border-light-gray shadow-sm px-6 py-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-navy truncate">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {user?.email}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <span
                className={cn(
                  "text-xs font-medium px-2.5 py-1 rounded-full border",
                  user?.isVerified
                    ? "bg-success/10 text-success border-success/20"
                    : "bg-warning/10 text-warning border-warning/20",
                )}
              >
                {user?.isVerified ? "✓ Verified" : "Pending Verification"}
              </span>
              {user?.role && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-royal/10 text-royal border border-royal/20">
                  {user.role}
                </span>
              )}
            </div>
          </div>
        </div>

        <ProfilePhotoCard />
        <ProfileInfoCard />
        <VerificationCard />
      </div>
    </CustomerLayout>
  );
}
