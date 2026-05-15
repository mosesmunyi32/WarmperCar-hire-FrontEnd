"use client"

import { useState } from "react"
import { ArrowRight, Eye, EyeOff, ShieldCheck, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { cn } from "@/lib/utils"
import { CustomerForm, GL, GI } from "./types"
import { UploadSlot } from "./upload-slot"

export function NewCustomerForm({
  form,
  onChange,
  idFront,
  idBack,
  onIdFrontChange,
  onIdBackChange,
  onSubmit,
  submitting,
}: {
  form: CustomerForm
  onChange: (k: keyof CustomerForm, v: string) => void
  idFront: File | null
  idBack: File | null
  onIdFrontChange: (f: File | null) => void
  onIdBackChange: (f: File | null) => void
  onSubmit: () => void
  submitting: boolean
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-light-gray shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="h-4 w-4 text-royal" />
          <h2 className="font-semibold text-navy text-sm">Customer Details</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={GL}>
              First Name <span className="text-danger">*</span>
            </label>
            <Input
              placeholder="John"
              value={form.firstName}
              onChange={(e) => onChange("firstName", e.target.value)}
              className={GI}
            />
          </div>
          <div>
            <label className={GL}>
              Last Name <span className="text-danger">*</span>
            </label>
            <Input
              placeholder="Doe"
              value={form.lastName}
              onChange={(e) => onChange("lastName", e.target.value)}
              className={GI}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={GL}>
              Email Address <span className="text-danger">*</span>
            </label>
            <Input
              type="email"
              placeholder="customer@example.com"
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
              className={GI}
            />
          </div>
          <div>
            <label className={GL}>
              Phone Number <span className="text-danger">*</span>
            </label>
            <Input
              type="tel"
              placeholder="0712 345 678"
              value={form.phoneNumber}
              onChange={(e) => onChange("phoneNumber", e.target.value)}
              className={GI}
            />
          </div>
          <div>
            <label className={GL}>
              Password <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Set account password"
                value={form.password}
                onChange={(e) => onChange("password", e.target.value)}
                className={cn(GI, "pr-10")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className={GL}>
              Date of Birth <span className="text-danger">*</span>
            </label>
            <DatePicker value={form.dateOfBirth} onChange={(v) => onChange("dateOfBirth", v)} placeholder="Select date" />
          </div>
          <div>
            <label className={GL}>
              Gender <span className="text-danger">*</span>
            </label>
            <select
              value={form.gender}
              onChange={(e) => onChange("gender", e.target.value)}
              className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
          <div>
            <label className={GL}>County</label>
            <Input
              placeholder="e.g. Nairobi"
              value={form.county}
              onChange={(e) => onChange("county", e.target.value)}
              className={GI}
            />
          </div>
          <div>
            <label className={GL}>City / Town</label>
            <Input
              placeholder="e.g. Westlands"
              value={form.city}
              onChange={(e) => onChange("city", e.target.value)}
              className={GI}
            />
          </div>
          <div>
            <label className={GL}>
              National ID Number <span className="text-danger">*</span>
            </label>
            <Input
              placeholder="Enter ID number"
              value={form.idNumber}
              onChange={(e) => onChange("idNumber", e.target.value)}
              className={GI}
            />
          </div>
          <div>
            <label className={GL}>
              Driver&apos;s Licence{" "}
              <span className="text-muted-foreground normal-case tracking-normal font-normal">(optional)</span>
            </label>
            <Input
              placeholder="Licence number"
              value={form.driversLicenceNumber}
              onChange={(e) => onChange("driversLicenceNumber", e.target.value)}
              className={GI}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={GL}>
              Alternative Phone{" "}
              <em className="text-muted-foreground normal-case tracking-normal font-normal not-italic">
                — <i>someone to call in case of emergency</i>
              </em>
            </label>
            <Input
              type="tel"
              placeholder="0712 345 678"
              value={form.alternativePhoneNumber}
              onChange={(e) => onChange("alternativePhoneNumber", e.target.value)}
              className={GI}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-light-gray shadow-sm p-6">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="h-4 w-4 text-royal" />
          <h2 className="font-semibold text-navy text-sm">ID Photos</h2>
          <span className="text-xs text-danger font-medium">* Required</span>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Both front and back of the National ID must be uploaded.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <UploadSlot
            label="ID Front Photo"
            file={idFront}
            onSelect={(f) => onIdFrontChange(f)}
            onClear={() => onIdFrontChange(null)}
          />
          <UploadSlot
            label="ID Back Photo"
            file={idBack}
            onSelect={(f) => onIdBackChange(f)}
            onClear={() => onIdBackChange(null)}
          />
        </div>
        {(idFront || idBack) && !(idFront && idBack) && (
          <p className="text-xs text-warning mt-3">
            Both front and back photos are required before proceeding.
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={onSubmit} disabled={submitting} className="bg-navy hover:bg-royal gap-2 px-8">
          {submitting ? (
            "Creating Account…"
          ) : (
            <>
              <span>Create Account</span> <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
