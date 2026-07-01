import { CarFormField } from "./car-form-field";

function formatNumberPlate(raw: string): string {
  const clean = raw.replace(/\s+/g, "").toUpperCase()
  return clean.length <= 3 ? clean : `${clean.slice(0, 3)} ${clean.slice(3)}`
}

interface BasicInfoForm {
  brand: string;
  model: string;
  yearOfManufacture: string;
  color: string;
  fuelType: string;
  transmission: string;
  numberOfPassengers: string;
  numberPlate: string;
  description: string;
}

const SELECT_CLASS =
  "w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

interface Props {
  form: BasicInfoForm;
  onChange: (key: keyof BasicInfoForm, value: string) => void;
  disabled?: boolean;
}

export function CarBasicInfoCard({ form, onChange, disabled }: Props) {
  const selectClass = `${SELECT_CLASS} ${disabled ? "bg-off-white text-muted-foreground cursor-default" : ""}`;
  return (
    <div className="bg-white rounded-xl border border-light-gray p-5 shadow-sm">
      <h2 className="font-semibold text-navy text-sm mb-4">
        Basic Information
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <CarFormField label="Brand" value={form.brand} onChange={(v) => onChange("brand", v)} disabled={disabled} />
        <CarFormField label="Model" value={form.model} onChange={(v) => onChange("model", v)} disabled={disabled} />
        <CarFormField label="Year" value={form.yearOfManufacture} onChange={(v) => onChange("yearOfManufacture", v)} type="number" disabled={disabled} />
        <CarFormField label="Color" value={form.color} onChange={(v) => onChange("color", v)} disabled={disabled} />

        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">Fuel Type</label>
          <select
            value={form.fuelType}
            onChange={(e) => onChange("fuelType", e.target.value as BasicInfoForm["fuelType"])}
            className={selectClass}
            disabled={disabled}
          >
            {["PETROL", "DIESEL", "ELECTRIC", "HYBRID"].map((f) => (
              <option value={f} key={f}>{f}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">Transmission</label>
          <select
            value={form.transmission}
            onChange={(e) => onChange("transmission", e.target.value as BasicInfoForm["transmission"])}
            className={selectClass}
            disabled={disabled}
          >
            <option value="AUTOMATIC">Automatic</option>
            <option value="MANUAL">Manual</option>
          </select>
        </div>

        <CarFormField label="No. of Passengers" value={form.numberOfPassengers} onChange={(v) => onChange("numberOfPassengers", v)} type="number" disabled={disabled} />
        <CarFormField label="Number Plate" value={form.numberPlate} onChange={(v) => onChange("numberPlate", formatNumberPlate(v))} placeholder="KDJ 760Y" disabled={disabled} />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-navy mb-1.5">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => onChange("description", e.target.value)}
          rows={3}
          disabled={disabled}
          className={`w-full rounded-lg border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none ${disabled ? "bg-off-white text-muted-foreground cursor-default" : "bg-background"}`}
        />
      </div>
    </div>
  );
}
