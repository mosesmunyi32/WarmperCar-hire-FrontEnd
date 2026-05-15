"use client";

import { useEffect, useState } from "react";
import {
  IdCard,
  Shield,
  Pencil,
  Save,
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { profileService } from "@/services/profileService";
import useAuthStore from "@/store/authStore";
import { cn } from "@/lib/utils";
import { SmartField, UploadField, SectionCard } from "./field-helpers";

export function VerificationCard() {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [idNumber, setIdNumber] = useState("");
  const [driversLicenceNumber, setDriversLicenceNumber] = useState("");
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [licenceFile, setLicenceFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      setIdNumber(user.idNumber ?? "");
      setDriversLicenceNumber(user.driversLicenceNumber ?? "");
    }
  }, [user]);

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setIdFrontFile(null);
    setIdBackFile(null);
    setLicenceFile(null);
    if (user) {
      setIdNumber(user.idNumber ?? "");
      setDriversLicenceNumber(user.driversLicenceNumber ?? "");
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    if ((idFrontFile || idBackFile) && !(idFrontFile && idBackFile)) {
      setError("Both ID front and back photos are required together.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let updated = await profileService.updateProfile(user.id, {
        idNumber: !user.idNumber ? idNumber || undefined : undefined,
        driversLicenceNumber: driversLicenceNumber || undefined,
      });

      if (idFrontFile && idBackFile) {
        const fd = new FormData();
        fd.append("frontPhoto", idFrontFile);
        fd.append("backPhoto", idBackFile);
        await profileService.updateIdPhotos(user.id, fd);
        setIdFrontFile(null);
        setIdBackFile(null);
        updated = await profileService.getMyProfile(user.id);
      }

      if (licenceFile) {
        updated = await profileService.uploadDriversLicencePhoto(licenceFile);
        setLicenceFile(null);
      }

      setUser(updated);
      setIsEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const editActions = (
    <div className="flex justify-end mb-4">
      {!isEditing ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="border-navy text-navy hover:bg-navy hover:text-white gap-1.5"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Button>
      ) : (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-navy hover:bg-royal gap-1.5"
          >
            <Save className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Save"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={saving}
            className="gap-1.5"
          >
            <X className="h-3.5 w-3.5" /> Cancel
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      {success && (
        <div className="flex items-center gap-3 bg-success/10 border border-success/20 text-success text-sm rounded-xl px-4 py-3">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> Verification documents
          updated.
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3">
          <XCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* ── Identity Documents ── */}
      <SectionCard title="Identity Documents" icon={IdCard}>
        {editActions}
        <div className="space-y-4">
          {/* National ID Number */}
          {user?.idNumber ? (
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                National ID Number
              </label>
              <div className="text-sm px-3 py-2 rounded-lg border border-light-gray bg-off-white text-muted-foreground font-mono select-none">
                {user.idNumber}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                National ID cannot be changed once submitted.
              </p>
            </div>
          ) : isEditing ? (
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                National ID Number
              </label>
              <Input
                value={idNumber}
                placeholder="Enter your national ID number"
                onChange={(e) => setIdNumber(e.target.value)}
                className="h-10 text-sm font-mono"
              />
              <div className="flex items-start gap-2 mt-2 bg-warning/5 border border-warning/20 rounded-lg px-3 py-2">
                <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                <p className="text-xs text-warning">
                  Once submitted, your National ID cannot be changed.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                National ID Number
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/5 px-4 py-3">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                <div>
                  <p className="text-sm font-medium text-navy">Not provided</p>
                  <p className="text-xs text-warning">
                    Click Edit to add your National ID.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ID Photos */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-2">
                ID Front Photo
              </label>
              <UploadField
                label="ID Front"
                hint="Clear photo of your ID front side"
                locked={!!user?.idFrontPhoto}
                file={idFrontFile}
                currentUrl={user?.idFrontPhoto ?? null}
                onSelect={setIdFrontFile}
                onClear={() => setIdFrontFile(null)}
                isEditing={isEditing}
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-2">
                ID Back Photo
              </label>
              <UploadField
                label="ID Back"
                hint="Clear photo of your ID back side"
                locked={!!user?.idBackPhoto}
                file={idBackFile}
                currentUrl={user?.idBackPhoto ?? null}
                onSelect={setIdBackFile}
                onClear={() => setIdBackFile(null)}
                isEditing={isEditing}
              />
            </div>
          </div>
          {isEditing &&
            (idFrontFile || idBackFile) &&
            !(idFrontFile && idBackFile) && (
              <p className="text-xs text-warning flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                Both front and back photos must be uploaded together.
              </p>
            )}
        </div>
      </SectionCard>
    </div>
  );
}
