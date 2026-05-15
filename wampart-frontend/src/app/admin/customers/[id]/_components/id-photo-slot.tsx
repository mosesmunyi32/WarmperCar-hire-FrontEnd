"use client";

import { useRef } from "react";
import { Image as ImageIcon, Trash2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function IdPhotoSlot({
  label,
  currentUrl,
  stagedFile,
  deleting,
  onView,
  onSelect,
  onClear,
  onDelete,
}: {
  label: string;
  currentUrl: string | null | undefined;
  stagedFile: File | null;
  deleting?: boolean;
  onView: (src: string) => void;
  onSelect: (f: File) => void;
  onClear: () => void;
  onDelete?: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const previewUrl = stagedFile ? URL.createObjectURL(stagedFile) : currentUrl;

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
      <div className="relative group">
        {previewUrl ? (
          <button
            type="button"
            onClick={() => !stagedFile && onView(previewUrl)}
            className={cn(
              "w-full aspect-video rounded-lg border overflow-hidden relative",
              stagedFile
                ? "border-warning/60 cursor-default"
                : "border-light-gray hover:border-royal transition-colors cursor-pointer",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt={label} className="w-full h-full object-cover" />
            {!stagedFile && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  View
                </span>
              </div>
            )}
            {!stagedFile && onDelete && (
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
            {stagedFile && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onClear(); }}
                className="absolute top-1 right-1 bg-white/90 hover:bg-white rounded-full p-0.5 shadow transition-colors"
              >
                <X className="h-3 w-3 text-muted-foreground" />
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
          onClick={() => ref.current?.click()}
          className="absolute bottom-1.5 right-1.5 flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md bg-navy/80 hover:bg-navy text-white transition-colors"
        >
          <Upload className="h-3 w-3" />
          {stagedFile ? "Change" : currentUrl ? "Replace" : "Select"}
        </button>
      </div>
      {stagedFile && (
        <p className="text-xs text-warning mt-1 truncate">{stagedFile.name}</p>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onSelect(f); e.target.value = ""; }}
      />
    </div>
  );
}
