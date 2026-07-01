"use client";

import { useRef } from "react";
import { Image as ImageIcon, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfilePhotoSlot({
  label,
  url,
  uploading,
  deleting,
  onView,
  onUpload,
  onDelete,
}: {
  label: string;
  url: string | null | undefined;
  uploading: boolean;
  deleting?: boolean;
  onView: (src: string) => void;
  onUpload: (file: File) => void;
  onDelete?: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
      <div className="relative group">
        {url ? (
          <button
            type="button"
            onClick={() => onView(url)}
            className="w-full aspect-video rounded-lg border border-light-gray overflow-hidden hover:border-royal transition-colors relative"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                View
              </span>
            </div>
            {onDelete && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                disabled={deleting}
                className={cn(
                  "absolute top-1 left-1 flex items-center gap-1 text-xs font-medium px-1.5 py-1 rounded-md transition-colors opacity-0 group-hover:opacity-100",
                  deleting ? "bg-danger/50 text-white cursor-not-allowed" : "bg-danger/80 hover:bg-danger text-white"
                )}
              >
                <Trash2 className="h-3 w-3" />
                {deleting ? "…" : "Delete"}
              </button>
            )}
          </button>
        ) : (
          <div className="w-full aspect-video rounded-lg border border-dashed border-light-gray flex flex-col items-center justify-center gap-1 text-muted-foreground">
            <ImageIcon className="h-5 w-5" />
            <p className="text-xs">Not uploaded</p>
          </div>
        )}
        <button
          type="button"
          disabled={uploading}
          onClick={() => ref.current?.click()}
          className={cn(
            "absolute bottom-1.5 right-1.5 flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md transition-colors",
            uploading
              ? "bg-navy/50 text-white cursor-not-allowed"
              : "bg-navy/80 hover:bg-navy text-white",
          )}
        >
          <Upload className="h-3 w-3" />
          {uploading ? "Uploading…" : url ? "Replace" : "Upload"}
        </button>
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }}
      />
    </div>
  );
}
