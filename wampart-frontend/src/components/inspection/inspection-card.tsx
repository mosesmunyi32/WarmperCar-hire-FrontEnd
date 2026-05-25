"use client"

import { useState } from "react"
import { Camera, AlertTriangle, CheckCircle2, XCircle, ChevronDown, ChevronUp, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminInspectionResponse, CustomerInspectionResponse, InspectionRespondRequest } from "@/types"
import { ConditionBadge, CustomerResponseBadge } from "./inspection-badges"
import { format } from "date-fns"

function fmt(iso: string) {
  try { return format(new Date(iso), "MMM d, yyyy, h:mm a") } catch { return iso }
}

function PhotoStrip({ photos }: { photos: string[] }) {
  const [open, setOpen] = useState(false)
  if (!photos.length) return null
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-royal hover:underline"
      >
        <Camera className="h-3.5 w-3.5" />
        {photos.length} damage photo{photos.length !== 1 ? "s" : ""}
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      {open && (
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {photos.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Damage ${i + 1}`}
                className="w-full h-28 object-cover rounded-lg border border-light-gray hover:opacity-90 transition-opacity"
              />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

interface AdminInspectionCardProps {
  inspection: AdminInspectionResponse
  onEdit: () => void
  onConfirmOnBehalf?: () => void
  confirmingOnBehalf?: boolean
}

export function AdminInspectionCard({ inspection, onEdit, onConfirmOnBehalf, confirmingOnBehalf }: AdminInspectionCardProps) {
  const isPost = inspection.inspectionType === "POST_INSPECTION"

  return (
    <div className="bg-white rounded-xl border border-light-gray shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-light-gray bg-off-white flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
            isPost ? "bg-navy/10 text-navy border-navy/20" : "bg-royal/10 text-royal border-royal/20"
          }`}>
            {isPost ? "Post-Inspection" : "Pre-Inspection"}
          </span>
          <ConditionBadge value={inspection.condition} />
          {inspection.isDamaged && (
            <span className="text-xs bg-danger/10 text-danger border border-danger/20 px-2 py-0.5 rounded-full font-semibold">
              Damage Recorded
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <CustomerResponseBadge value={inspection.customerResponse} adminView />
          {inspection.customerResponse === "PENDING" && onConfirmOnBehalf && (
            <Button
              size="sm"
              onClick={onConfirmOnBehalf}
              disabled={confirmingOnBehalf}
              className="h-7 px-2.5 text-xs gap-1.5 bg-success hover:bg-success/90 text-white"
            >
              <CheckCircle2 className="h-3 w-3" />
              {confirmingOnBehalf ? "Confirming…" : "Confirm on Behalf"}
            </Button>
          )}
          {inspection.customerResponse === "REJECTED" && (
            <Button
              size="sm"
              variant="outline"
              onClick={onEdit}
              className="h-7 px-2.5 text-xs gap-1.5 border-warning/40 text-warning hover:bg-warning/5"
            >
              <Edit2 className="h-3 w-3" /> Edit
            </Button>
          )}
        </div>
      </div>

      <div className="px-5 py-4 space-y-3">
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span>Ref: <span className="font-mono text-navy">{inspection.inspectionReference}</span></span>
          <span>Date: <span className="text-navy">{fmt(inspection.dateOfInspection)}</span></span>
        </div>

        {inspection.inspectionComment && (
          <div className="bg-off-white rounded-lg border border-light-gray px-3 py-2.5">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Inspection Notes</p>
            <p className="text-sm text-foreground">{inspection.inspectionComment}</p>
          </div>
        )}

        {inspection.customerComment && (
          <div className={`rounded-lg border px-3 py-2.5 ${
            inspection.customerResponse === "REJECTED"
              ? "bg-danger/5 border-danger/20"
              : "bg-off-white border-light-gray"
          }`}>
            <p className="text-xs font-semibold text-muted-foreground mb-1">Customer Comment</p>
            <p className="text-sm text-foreground">{inspection.customerComment}</p>
          </div>
        )}

        {isPost && inspection.isDamageChargeRequired && (
          <div className="flex items-center gap-2 bg-danger/5 border border-danger/20 rounded-lg px-3 py-2.5">
            <AlertTriangle className="h-4 w-4 text-danger shrink-0" />
            <div>
              <p className="text-xs font-semibold text-danger">Damage Charge Required</p>
              {inspection.damageChargeAmount != null && (
                <p className="text-sm font-bold text-danger">KES {inspection.damageChargeAmount.toLocaleString()}</p>
              )}
            </div>
          </div>
        )}

        {inspection.isDamaged && <PhotoStrip photos={inspection.damagedPhotos} />}
      </div>
    </div>
  )
}

interface CustomerInspectionCardProps {
  inspection: CustomerInspectionResponse
  onRespond: (data: InspectionRespondRequest) => Promise<void>
  responding: boolean
}

export function CustomerInspectionCard({ inspection, onRespond, responding }: CustomerInspectionCardProps) {
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [comment, setComment] = useState("")
  const [commentError, setCommentError] = useState("")

  const isPost = inspection.inspectionType === "POST_INSPECTION"

  const handleConfirm = () => onRespond({ customerResponse: "CONFIRMED" })

  const handleReject = () => {
    if (!comment.trim()) {
      setCommentError("Please describe why you're disputing this inspection.")
      return
    }
    setCommentError("")
    onRespond({ customerResponse: "REJECTED", customerComment: comment.trim() })
  }

  return (
    <div className="bg-white rounded-xl border border-light-gray shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-light-gray bg-off-white flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
            isPost ? "bg-navy/10 text-navy border-navy/20" : "bg-royal/10 text-royal border-royal/20"
          }`}>
            {isPost ? "Post-Inspection" : "Pre-Inspection"}
          </span>
          <ConditionBadge value={inspection.condition} />
          {inspection.isDamaged && (
            <span className="text-xs bg-danger/10 text-danger border border-danger/20 px-2 py-0.5 rounded-full font-semibold">
              Damage Recorded
            </span>
          )}
        </div>
        <CustomerResponseBadge value={inspection.customerResponse} />
      </div>

      <div className="px-5 py-4 space-y-3">
        <p className="text-xs text-muted-foreground">
          Inspected on <span className="text-navy">{fmt(inspection.dateOfInspection)}</span>
        </p>

        {inspection.inspectionComment && (
          <div className="bg-off-white rounded-lg border border-light-gray px-3 py-2.5">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Inspector&apos;s Notes</p>
            <p className="text-sm text-foreground">{inspection.inspectionComment}</p>
          </div>
        )}

        {isPost && inspection.isDamageChargeRequired && (
          <div className="flex items-start gap-3 bg-danger/5 border border-danger/20 rounded-lg px-3 py-2.5">
            <AlertTriangle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-danger">Damage Charge Applied</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                A damage charge of{" "}
                <span className="font-bold text-danger">
                  KES {inspection.damageChargeAmount?.toLocaleString()}
                </span>{" "}
                has been recorded for damage to the vehicle.
              </p>
            </div>
          </div>
        )}

        {inspection.isDamaged && <PhotoStrip photos={inspection.damagedPhotos} />}

        {inspection.customerComment && inspection.customerResponse !== "PENDING" && (
          <div className="bg-off-white rounded-lg border border-light-gray px-3 py-2.5">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Your Response Comment</p>
            <p className="text-sm text-foreground">{inspection.customerComment}</p>
          </div>
        )}

        {inspection.customerResponse === "CONFIRMED" && (
          <p className="flex items-center gap-1.5 text-xs text-success font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> You confirmed this inspection
          </p>
        )}

        {inspection.customerResponse === "PENDING" && (
          <div className="border-t border-light-gray pt-3 space-y-3">
            <p className="text-xs text-muted-foreground font-medium">
              Please review and confirm or dispute this inspection report.
            </p>

            {showRejectForm ? (
              <div className="space-y-2">
                <textarea
                  value={comment}
                  onChange={(e) => { setComment(e.target.value); setCommentError("") }}
                  rows={3}
                  placeholder="Describe why you are disputing this inspection…"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                {commentError && <p className="text-xs text-danger">{commentError}</p>}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleReject}
                    disabled={responding}
                    className="bg-danger hover:bg-danger/90 text-white"
                  >
                    {responding ? "Submitting…" : "Submit Dispute"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setShowRejectForm(false); setComment(""); setCommentError("") }}
                    disabled={responding}
                  >
                    Back
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleConfirm}
                  disabled={responding}
                  className="bg-success hover:bg-success/90 text-white gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {responding ? "Confirming…" : "Confirm"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowRejectForm(true)}
                  disabled={responding}
                  className="border-danger/30 text-danger hover:bg-danger/5 gap-1.5"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Dispute
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
