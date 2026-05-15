"use client";

import { useRef, useState } from "react";
import { Camera, Save, X, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { profileService } from "@/services/profileService";
import useAuthStore from "@/store/authStore";

export function ProfilePhotoCard() {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const avatarSrc = preview ?? user?.profilePhoto ?? null;
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`;

  const handleSelect = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFile(null);
    setPreview(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!file || !user?.id) return;
    setSaving(true);
    setError(null);
    try {
      const profileFormData = new FormData();
      profileFormData.append("file", file);
      await profileService.updateProfilePhoto(user.id, profileFormData);
      const updated = await profileService.getMyProfile(user.id);
      setUser(updated);
      setFile(null);
      setPreview(null);
      setIsEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      setError("Failed to upload photo. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-light-gray shadow-sm p-6">
      {success && (
        <div className="flex items-center gap-3 bg-success/10 border border-success/20 text-success text-sm rounded-xl px-4 py-3 mb-4">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Profile photo updated.
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3 mb-4">
          <XCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-5">
        {/* Avatar */}
        <div className="relative inline-flex shrink-0">
          <div className="h-20 w-20 rounded-full border-4 border-off-white shadow overflow-hidden">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-royal text-white text-2xl font-bold">
                {initials}
              </div>
            )}
          </div>
          {isEditing && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-navy text-white flex items-center justify-center shadow-md hover:bg-royal transition-colors"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleSelect(f);
              e.target.value = "";
            }}
          />
        </div>

        {/* Status text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-navy">Profile Photo</p>
          {file ? (
            <p className="text-xs text-azure mt-0.5">
              {file.name} — ready to upload
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-0.5">
              {user?.profilePhoto ? "Photo on file" : "No photo uploaded yet"}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="shrink-0 flex gap-2">
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="border-navy text-navy hover:bg-navy hover:text-white gap-1.5"
            >
              <Camera className="h-3.5 w-3.5" /> Change Photo
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving || !file}
                className="bg-navy hover:bg-royal gap-1.5"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? "Uploading..." : "Upload"}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
