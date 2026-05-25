"use client";

import { useEffect, useState } from "react";
import { User, Pencil, Save, X, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { profileService } from "@/services/profileService";
import useAuthStore from "@/store/authStore";
import { DisabledField, SmartField, SectionCard } from "./field-helpers";

export function ProfileInfoCard() {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    phoneNumber: "",
    alternativePhoneNumber: "",
    dateOfBirth: "",
    gender: "",
    county: "",
    city: "",
  });

  useEffect(() => {
    if (user) {
      console.log(user);
      setForm({
        phoneNumber: user.phoneNumber ?? "",
        alternativePhoneNumber: user.alternativePhoneNumber ?? "",
        dateOfBirth: user.dateOfBirth ?? "",
        gender: user.gender ?? "",
        county: user.county ?? "",
        city: user.city ?? "",
      });
    }
  }, [user]);

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    if (user) {
      setForm({
        phoneNumber: user.phoneNumber ?? "",
        alternativePhoneNumber: user.alternativePhoneNumber ?? "",
        dateOfBirth: user.dateOfBirth ?? "",
        gender: user.gender ?? "",
        county: user.county ?? "",
        city: user.city ?? "",
      });
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    // Validate required fields (@NonNull on backend)
    if (!form.phoneNumber.trim()) { setError("Phone number is required."); return; }
    if (!form.dateOfBirth) { setError("Date of birth is required."); return; }
    if (!user.gender && !form.gender) { setError("Gender is required."); return; }
    if (!form.county.trim()) { setError("County is required."); return; }
    if (!form.city.trim()) { setError("City is required."); return; }

    setSaving(true);
    setError(null);
    try {
      await profileService.updateProfile(user.id, {
        phoneNumber: form.phoneNumber.trim(),
        alternativePhoneNumber: form.alternativePhoneNumber.trim() || undefined,
        dateOfBirth: form.dateOfBirth,
        gender: !user.gender ? form.gender || undefined : undefined,
        county: form.county.trim(),
        city: form.city.trim(),
      });
      const updated = await profileService.getMyProfile(user.id);
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

  return (
    <div className="space-y-5">
      <SectionCard title="Personal Information" icon={User}>
        {success && (
          <div className="flex items-center gap-3 bg-success/10 border border-success/20 text-success text-sm rounded-xl px-4 py-3 mb-4">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> Profile updated.
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3 mb-4">
            <XCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DisabledField label="First Name" value={user?.firstName} />
          <DisabledField label="Last Name" value={user?.lastName} />
          <DisabledField label="Email Address" value={user?.email} />

          <SmartField
            label="Phone Number"
            value={user?.phoneNumber}
            editValue={form.phoneNumber}
            placeholder="0712 345 678"
            isEditing={isEditing}
            onChange={(v) => setForm((f) => ({ ...f, phoneNumber: v }))}
            required
          />
          <SmartField
            label="Alternative Phone"
            value={user?.alternativePhoneNumber}
            editValue={form.alternativePhoneNumber}
            placeholder="0712 345 678"
            isEditing={isEditing}
            onChange={(v) =>
              setForm((f) => ({ ...f, alternativePhoneNumber: v }))
            }
          />

          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Date of Birth
              {isEditing && <span className="text-danger ml-0.5">*</span>}
            </label>
            {isEditing ? (
              <DatePicker
                value={form.dateOfBirth}
                onChange={(v) => setForm((f) => ({ ...f, dateOfBirth: v }))}
                placeholder="Select date of birth"
              />
            ) : (
              <DisabledField
                label=""
                value={form.dateOfBirth ? form.dateOfBirth.split("T")[0] : null}
              />
            )}
          </div>

          {user?.gender ? (
            <DisabledField label="Gender" value={user.gender} />
          ) : isEditing ? (
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Gender
                <span className="text-danger ml-0.5">*</span>
              </label>
              <select
                value={form.gender}
                onChange={(e) =>
                  setForm((f) => ({ ...f, gender: e.target.value }))
                }
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          ) : (
            <DisabledField label="Gender" value={null} />
          )}

          <SmartField
            label="County"
            value={user?.county}
            editValue={form.county}
            placeholder="e.g. Nairobi"
            isEditing={isEditing}
            onChange={(v) => setForm((f) => ({ ...f, county: v }))}
            required
          />

          <SmartField
            label="City"
            value={user?.city}
            editValue={form.city}
            placeholder="e.g. Westlands"
            isEditing={isEditing}
            onChange={(v) => setForm((f) => ({ ...f, city: v }))}
            required
          />
        </div>
      </SectionCard>
    </div>
  );
}
