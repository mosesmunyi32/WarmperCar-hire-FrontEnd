"use client"

import { useRef, useState } from "react"
import { X, AlertTriangle, Upload, ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CarCondition, CreateInspectionRequest, UpdateInspectionRequest } from "@/types"
import { inspectionService } from "@/services/inspectionService"
import { toast } from "sonner"

const CONDITIONS: CarCondition[] = ["EXCELLENT", "GOOD", "FAIR", "POOR"]

interface InspectionFormProps {
  bookingId?: string            // only needed for create
  isPost?: boolean              // post-inspection vs pre-inspection
  initial?: Partial<UpdateInspectionRequest>
  submitLabel: string
  submitting: boolean
  onSubmit: (data: CreateInspectionRequest | UpdateInspectionRequest) => void
  onCancel: () => void
  showEditWarning?: boolean
}

export function InspectionForm({
  bookingId,
  isPost = false,
  initial,
  submitLabel,
  submitting,
  onSubmit,
  onCancel,
  showEditWarning = false,
}: InspectionFormProps) {
  const [condition, setCondition] = useState<CarCondition>(initial?.condition ?? "GOOD")
  const [isDamaged, setIsDamaged] = useState(initial?.isDamaged ?? false)
  const [comment, setComment] = useState(initial?.inspectionComment ?? "")
  const [photos, setPhotos] = useState<string[]>(initial?.damagedPhotos?.filter(Boolean) ?? [])
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [isDamageCharge, setIsDamageCharge] = useState(initial?.isDamageChargeRequired ?? false)
  const [chargeAmount, setChargeAmount] = useState(initial?.damageChargeAmount?.toString() ?? "")
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setPendingFiles((prev) => [...prev, ...files])
    e.target.value = ""
  }

  const handleUpload = async () => {
    if (!bookingId || !pendingFiles.length) return
    setUploading(true)
    try {
      const urls = await inspectionService.uploadDamagePhotos(bookingId, pendingFiles)
      setPhotos((prev) => [...prev, ...urls])
      setPendingFiles([])
      toast.success(`${urls.length} photo${urls.length > 1 ? "s" : ""} uploaded.`)
    } catch {
      toast.error("Failed to upload photos. Try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (isDamaged && !comment.trim()) {
      setError("Inspection comment is required when damage is recorded.")
      return
    }
    if (isDamaged && pendingFiles.length > 0) {
      setError("You have selected photos that haven't been uploaded yet. Click 'Upload Photos' first.")
      return
    }
    const payload: CreateInspectionRequest | UpdateInspectionRequest = {
      ...(bookingId ? { bookingId } : {}),
      condition,
      isDamaged,
      inspectionComment: comment.trim() || undefined,
      damagedPhotos: isDamaged ? photos : [],
      ...(isPost && isDamaged
        ? {
            isDamageChargeRequired: isDamageCharge,
            damageChargeAmount: isDamageCharge && chargeAmount ? Number(chargeAmount) : undefined,
          }
        : {}),
    }
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showEditWarning && (
        <div className="flex items-start gap-2 bg-warning/5 border border-warning/30 rounded-lg px-3 py-2.5 text-xs text-warning">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          Editing this inspection will require the customer to confirm again.
        </div>
      )}

      {/* Condition */}
      <div>
        <label className="block text-xs font-semibold text-navy mb-2">Car Condition</label>
        <div className="flex gap-2 flex-wrap">
          {CONDITIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCondition(c)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                condition === c
                  ? c === "EXCELLENT" ? "bg-success text-white border-success"
                  : c === "GOOD"      ? "bg-royal text-white border-royal"
                  : c === "FAIR"      ? "bg-warning text-white border-warning"
                  :                     "bg-danger text-white border-danger"
                  : "bg-white text-muted-foreground border-light-gray hover:border-navy/30"
              }`}
            >
              {c.charAt(0) + c.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Damage toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={isDamaged}
          onClick={() => setIsDamaged((v) => !v)}
          className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
            isDamaged ? "bg-danger" : "bg-muted-foreground/30"
          }`}
        >
          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${isDamaged ? "translate-x-4" : "translate-x-0"}`} />
        </button>
        <span className="text-sm font-medium text-navy">Damage recorded</span>
        {isDamaged && (
          <span className="text-xs bg-danger/10 text-danger border border-danger/20 px-2 py-0.5 rounded-full font-semibold">
            Damage Recorded
          </span>
        )}
      </div>

      {/* Comment */}
      <div>
        <label className="block text-xs font-semibold text-navy mb-1.5">
          Inspection Comment{isDamaged && <span className="text-danger ml-1">*</span>}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder={isDamaged ? "Describe the damage in detail…" : "Optional notes about the car condition…"}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      {/* Damage photos — file upload */}
      {isDamaged && (
        <div>
          <label className="block text-xs font-semibold text-navy mb-2">Damage Photos</label>

          {/* Uploaded photos grid */}
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {photos.map((url, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden border border-light-gray aspect-square bg-off-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`damage-${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Pending (not yet uploaded) previews */}
          {pendingFiles.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-warning font-medium mb-1.5 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> {pendingFiles.length} file{pendingFiles.length > 1 ? "s" : ""} selected — not uploaded yet
              </p>
              <div className="grid grid-cols-3 gap-2">
                {pendingFiles.map((f, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden border border-warning/40 aspect-square bg-off-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover opacity-70" />
                    <button
                      type="button"
                      onClick={() => setPendingFiles(pendingFiles.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs font-medium border border-light-gray rounded-lg px-3 py-1.5 text-navy hover:border-royal/40 hover:bg-off-white transition-colors"
            >
              <ImageIcon className="h-3.5 w-3.5" /> Choose Photos
            </button>
            {pendingFiles.length > 0 && (
              <Button
                type="button"
                size="sm"
                onClick={handleUpload}
                disabled={uploading || !bookingId}
                className="bg-royal hover:bg-navy text-white gap-1.5 h-8 text-xs"
              >
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                {uploading ? "Uploading…" : `Upload ${pendingFiles.length} Photo${pendingFiles.length > 1 ? "s" : ""}`}
              </Button>
            )}
          </div>
          {!bookingId && (
            <p className="text-xs text-muted-foreground mt-1.5">Save the inspection first to enable photo uploads.</p>
          )}
        </div>
      )}

      {/* Damage charge — post-inspection only, when isDamaged */}
      {isPost && isDamaged && (
        <div className="space-y-3 bg-danger/5 border border-danger/20 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={isDamageCharge}
              onClick={() => setIsDamageCharge((v) => !v)}
              className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                isDamageCharge ? "bg-danger" : "bg-muted-foreground/30"
              }`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${isDamageCharge ? "translate-x-4" : "translate-x-0"}`} />
            </button>
            <span className="text-sm font-medium text-navy">Damage charge required</span>
          </div>
          {isDamageCharge && (
            <div>
              <label className="block text-xs font-semibold text-navy mb-1.5">
                Charge Amount (KES) <span className="text-danger">*</span>
              </label>
              <Input
                type="number"
                min={0}
                placeholder="e.g. 5000"
                value={chargeAmount}
                onChange={(e) => setChargeAmount(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" disabled={submitting} className="bg-navy hover:bg-royal gap-2">
          {submitting ? "Saving…" : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
