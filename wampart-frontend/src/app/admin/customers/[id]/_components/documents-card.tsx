import { IdCard, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserResponse } from "@/types";
import { IdPhotoSlot } from "./id-photo-slot";
import { ProfilePhotoSlot } from "./profile-photo-slot";

export function DocumentsCard({
  customer,
  stagedFront,
  stagedBack,
  uploadingIdPhotos,
  uploadingProfilePhoto,
  deletingFront,
  deletingBack,
  deletingProfile,
  onView,
  onFrontSelect,
  onFrontClear,
  onBackSelect,
  onBackClear,
  onIdPhotosUpload,
  onProfilePhotoUpload,
  onFrontDelete,
  onBackDelete,
  onProfileDelete,
}: {
  customer: UserResponse;
  stagedFront: File | null;
  stagedBack: File | null;
  uploadingIdPhotos: boolean;
  uploadingProfilePhoto: boolean;
  deletingFront: boolean;
  deletingBack: boolean;
  deletingProfile: boolean;
  onView: (src: string) => void;
  onFrontSelect: (f: File) => void;
  onFrontClear: () => void;
  onBackSelect: (f: File) => void;
  onBackClear: () => void;
  onIdPhotosUpload: () => void;
  onProfilePhotoUpload: (f: File) => void;
  onFrontDelete: () => void;
  onBackDelete: () => void;
  onProfileDelete: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-light-gray p-5 shadow-sm">
      <h2 className="font-semibold text-navy text-sm mb-1 flex items-center gap-2">
        <IdCard className="h-4 w-4 text-royal" /> Identity Documents
      </h2>

      {/* ID Photos — front + back sent together */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-3">
          Select both front and back, then upload together.
        </p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <IdPhotoSlot
            label="ID Front"
            currentUrl={customer.idFrontPhoto}
            stagedFile={stagedFront}
            deleting={deletingFront}
            onView={onView}
            onSelect={onFrontSelect}
            onClear={onFrontClear}
            onDelete={onFrontDelete}
          />
          <IdPhotoSlot
            label="ID Back"
            currentUrl={customer.idBackPhoto}
            stagedFile={stagedBack}
            deleting={deletingBack}
            onView={onView}
            onSelect={onBackSelect}
            onClear={onBackClear}
            onDelete={onBackDelete}
          />
        </div>
        {(stagedFront || stagedBack) && (
          <div className="space-y-2">
            {!(stagedFront && stagedBack) && (
              <p className="text-xs text-warning text-center">
                Both front and back photos must be selected before uploading.
              </p>
            )}
            <Button
              size="sm"
              onClick={onIdPhotosUpload}
              disabled={uploadingIdPhotos || !stagedFront || !stagedBack}
              className="w-full bg-navy hover:bg-royal gap-2 h-9"
            >
              <Upload className="h-3.5 w-3.5" />
              {uploadingIdPhotos ? "Uploading…" : "Upload ID Photos"}
            </Button>
          </div>
        )}
      </div>

      {/* Profile photo — uploaded independently */}
      <div className="border-t border-light-gray pt-4">
        <ProfilePhotoSlot
          label="Profile Photo"
          url={customer.profilePhoto}
          uploading={uploadingProfilePhoto}
          deleting={deletingProfile}
          onView={onView}
          onUpload={onProfilePhotoUpload}
          onDelete={onProfileDelete}
        />
      </div>
    </div>
  );
}
