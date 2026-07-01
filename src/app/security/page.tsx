"use client";

import { CustomerLayout } from "@/components/customer-layout";
import { SecurityCard } from "@/components/profile/security-card";

export default function SecurityPage() {
  return (
    <CustomerLayout breadcrumbs={[{ label: "Security" }]}>
      <div className="mx-auto max-w-2xl p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy">Security</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your password and account security settings.
          </p>
        </div>
        <SecurityCard />
      </div>
    </CustomerLayout>
  );
}
