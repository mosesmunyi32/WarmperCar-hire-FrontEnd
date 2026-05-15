import { CarFormField } from "./car-form-field"

interface AdminDetailsForm {
  pricePerDay: string
  currentMileage: string
  serviceMileageInterval: string
  insuranceExpirationDate: string
}

interface Props {
  form: AdminDetailsForm
  onChange: (key: keyof AdminDetailsForm, value: string) => void
  disabled?: boolean
}

export function CarAdminDetailsCard({ form, onChange, disabled }: Props) {
  return (
    <div className="bg-white rounded-xl border border-light-gray p-5 shadow-sm">
      <h2 className="font-semibold text-navy text-sm mb-4">Admin Details</h2>
      <div className="grid gap-4">
        <CarFormField label="Price Per Day (KES)" value={form.pricePerDay} onChange={(v) => onChange("pricePerDay", v)} type="number" disabled={disabled} />
        <CarFormField label="Current Mileage (km)" value={form.currentMileage} onChange={(v) => onChange("currentMileage", v)} type="number" disabled={disabled} />
        <CarFormField label="Service Interval (km)" value={form.serviceMileageInterval} onChange={(v) => onChange("serviceMileageInterval", v)} type="number" disabled={disabled} />
        <CarFormField label="Insurance Expiry" value={form.insuranceExpirationDate} onChange={(v) => onChange("insuranceExpirationDate", v)} type="date" required disabled={disabled} />
      </div>
    </div>
  )
}
