"use client"

import { Calendar, MapPin, FileText } from "lucide-react"
import { Input } from "@/components/ui/input"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { BookingForm, GL, GI } from "./types"

export function BookingFields({
  form,
  onChange,
  bookedRanges = [],
}: {
  form: BookingForm
  onChange: (k: keyof BookingForm, v: string) => void
  bookedRanges?: { startDate: string; endDate: string }[]
}) {
  return (
    <>
      <div className="sm:col-span-2">
        <label className={`${GL} flex items-center gap-1.5`}>
          <Calendar className="h-3.5 w-3.5" /> Pick-up → Return Dates & Times{" "}
          <span className="text-danger">*</span>
        </label>
        <DateRangePicker
          startDate={form.startDate}
          endDate={form.endDate}
          bookedRanges={bookedRanges}
          onRangeChange={(start, end) => {
            onChange("startDate", start)
            onChange("endDate", end)
          }}
        />
      </div>
      <div className="sm:col-span-2">
        <label className={`${GL} flex items-center gap-1.5`}>
          <MapPin className="h-3.5 w-3.5" /> Travel Destination{" "}
          <span className="text-danger">*</span>
        </label>
        <Input
          placeholder="e.g. Mombasa"
          value={form.travelDestination}
          onChange={(e) => onChange("travelDestination", e.target.value)}
          className={GI}
        />
      </div>
      <div className="sm:col-span-2">
        <label className={GL}>
          <span className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Note{" "}
            <span className="text-muted-foreground normal-case tracking-normal font-normal">(optional)</span>
          </span>
        </label>
        <textarea
          placeholder="Any additional notes…"
          value={form.customerNote}
          onChange={(e) => onChange("customerNote", e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>
    </>
  )
}
