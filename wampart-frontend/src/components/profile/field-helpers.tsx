"use client"

import { useRef } from "react"
import type { ElementType } from "react"
import { Upload, X, CheckCircle2, CheckCircle, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"

export function DisabledField({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div>
      {label && <label className="block text-xs text-muted-foreground mb-1">{label}</label>}
      <div className="text-sm px-3 py-2 rounded-lg border border-light-gray bg-off-white text-muted-foreground select-none">
        {value || <span className="italic opacity-60">Not provided</span>}
      </div>
    </div>
  )
}

export function EditableField({
  label,
  value,
  placeholder,
  onChange,
  type = "text",
}: {
  label: string
  value: string
  placeholder?: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1">{label}</label>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 text-sm"
      />
    </div>
  )
}

export function SmartField({
  label,
  value,
  editValue,
  placeholder,
  isEditing,
  onChange,
}: {
  label: string
  value: string | null | undefined
  editValue?: string
  placeholder?: string
  isEditing: boolean
  onChange: (v: string) => void
}) {
  if (!isEditing) return <DisabledField label={label} value={value ?? null} />
  return <EditableField label={label} value={editValue ?? value ?? ""} placeholder={placeholder} onChange={onChange} />
}

export function ConditionalField({
  label,
  storedValue,
  formValue,
  placeholder,
  isEditing,
  onChange,
}: {
  label: string
  storedValue: string | null | undefined
  formValue: string
  placeholder?: string
  isEditing: boolean
  onChange: (v: string) => void
}) {
  if (storedValue) return <DisabledField label={label} value={storedValue} />
  if (!isEditing) return <DisabledField label={label} value={null} />
  return <EditableField label={label} value={formValue} placeholder={placeholder} onChange={onChange} />
}

export function UploadField({
  label,
  hint,
  locked,
  file,
  currentUrl,
  onSelect,
  onClear,
  isEditing,
}: {
  label: string
  hint?: string
  locked?: boolean
  file: File | null
  currentUrl: string | null
  onSelect: (f: File) => void
  onClear: () => void
  isEditing: boolean
}) {
  const ref = useRef<HTMLInputElement>(null)

  if (locked && currentUrl) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/5 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-4 w-4 text-success" />
        </div>
        <div>
          <p className="text-sm font-medium text-navy">{label}</p>
          <p className="text-xs text-success">Uploaded — cannot be replaced</p>
        </div>
      </div>
    )
  }

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-azure/30 bg-azure/5 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-azure/10">
          <CheckCircle className="h-4 w-4 text-azure" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-navy truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB — pending upload</p>
        </div>
        {isEditing && (
          <button type="button" onClick={onClear} className="text-muted-foreground hover:text-danger transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }

  if (!isEditing) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/5 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning/10">
          <AlertTriangle className="h-4 w-4 text-warning" />
        </div>
        <div>
          <p className="text-sm font-medium text-navy">{label}</p>
          <p className="text-xs text-warning">Not uploaded — click Edit to add</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="w-full flex items-center gap-3 rounded-xl border-2 border-dashed border-light-gray hover:border-azure/50 px-4 py-3 transition-colors group"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-off-white text-muted-foreground group-hover:bg-azure/10 group-hover:text-azure transition-colors">
          <Upload className="h-4 w-4" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-navy">Upload {label}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </button>
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

export function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: ElementType
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-light-gray shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-light-gray">
        <Icon className="h-4 w-4 text-royal" />
        <h3 className="font-semibold text-navy text-sm">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}
