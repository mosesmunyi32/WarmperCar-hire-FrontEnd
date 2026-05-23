import { Input } from "@/components/ui/input"
import { BookingForm, GL, GI } from "./types"

const nowLocal = () => {
  const d = new Date()
  d.setSeconds(0, 0)
  return d.toISOString().slice(0, 16)
}

export function BookingFields({
  form,
  onChange,
}: {
  form: BookingForm
  onChange: (k: keyof BookingForm, v: string) => void
}) {
  const minNow = nowLocal()
  return (
    <>
      <div>
        <label className={GL}>
          Pick-up Date & Time <span className="text-danger">*</span>
        </label>
        <Input
          type="datetime-local"
          value={form.startDate}
          min={minNow}
          onChange={(e) => onChange("startDate", e.target.value)}
          className={GI}
        />
      </div>
      <div>
        <label className={GL}>
          Return Date & Time <span className="text-danger">*</span>
        </label>
        <Input
          type="datetime-local"
          value={form.endDate}
          min={form.startDate || minNow}
          onChange={(e) => onChange("endDate", e.target.value)}
          className={GI}
        />
      </div>
      <div className="sm:col-span-2">
        <label className={GL}>
          Travel Destination <span className="text-danger">*</span>
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
          Note{" "}
          <span className="text-muted-foreground normal-case tracking-normal font-normal">(optional)</span>
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
