"use client"

import { useRef } from "react"
import { FileImage, Upload, X } from "lucide-react"
import { GL } from "./types"

export function UploadSlot({
  label,
  file,
  onSelect,
  onClear,
}: {
  label: string
  file: File | null
  onSelect: (f: File) => void
  onClear: () => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div>
      <p className={GL}>{label}</p>
      {file ? (
        <div className="flex items-center gap-3 rounded-xl border border-azure/30 bg-azure/5 px-4 py-3">
          <FileImage className="h-5 w-5 text-azure shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-navy truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
          <button type="button" onClick={onClear} className="text-muted-foreground hover:text-danger transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="w-full flex items-center gap-3 rounded-xl border-2 border-dashed border-light-gray hover:border-navy/40 px-4 py-3 transition-colors group"
        >
          <div className="h-8 w-8 rounded-full bg-off-white flex items-center justify-center group-hover:bg-navy/5 transition-colors shrink-0">
            <Upload className="h-4 w-4 text-muted-foreground group-hover:text-navy" />
          </div>
          <span className="text-sm text-muted-foreground group-hover:text-navy transition-colors">
            Click to upload {label}
          </span>
        </button>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onSelect(f)
          e.target.value = ""
        }}
      />
    </div>
  )
}
