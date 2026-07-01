import { CheckCircle2, Pencil, ShieldCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserResponse } from "@/types";

export function CustomerHeader({
  customer,
  isEditing,
  actionBusy,
  onStartEdit,
  onVerify,
  onUnverify,
  onActivate,
  onDeactivate,
}: {
  customer: UserResponse;
  isEditing: boolean;
  actionBusy: string | null;
  onStartEdit: () => void;
  onVerify: () => void;
  onUnverify: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-royal flex items-center justify-center text-white text-xl font-bold shrink-0">
          {customer.firstName?.[0]}{customer.lastName?.[0]}
        </div>
        <div>
          <h1 className="text-xl font-bold text-navy">
            {customer.firstName} {customer.lastName}
          </h1>
          <p className="text-muted-foreground text-sm">{customer.email}</p>
          <div className="flex gap-2 mt-1 flex-wrap">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${customer.isVerified ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}
            >
              {customer.isVerified ? "Verified" : "Unverified"}
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${customer.isActive ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}
            >
              {customer.isActive ? "Active" : "Blacklisted"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={onStartEdit}
            className="border-navy/20 text-navy hover:bg-navy/5 gap-1 h-8 text-xs"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit Info
          </Button>
        )}
        {customer.isVerified ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onUnverify}
            disabled={actionBusy === "unverify"}
            className="border-warning/30 text-warning hover:bg-warning/5 gap-1 h-8 text-xs"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {actionBusy === "unverify" ? "Unverifying..." : "Unverify"}
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={onVerify}
            disabled={actionBusy === "verify"}
            className="bg-success hover:bg-success/90 text-white gap-1 h-8 text-xs"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {actionBusy === "verify" ? "Verifying..." : "Verify Customer"}
          </Button>
        )}
        {customer.isActive ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onDeactivate}
            disabled={actionBusy === "deactivate"}
            className="border-danger/30 text-danger hover:bg-danger/5 gap-1 h-8 text-xs"
          >
            <UserX className="h-3.5 w-3.5" />
            {actionBusy === "deactivate" ? "..." : "Blacklist"}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onActivate}
            disabled={actionBusy === "activate"}
            className="border-success/30 text-success hover:bg-success/5 gap-1 h-8 text-xs"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {actionBusy === "activate" ? "..." : "Activate"}
          </Button>
        )}
      </div>
    </div>
  );
}
