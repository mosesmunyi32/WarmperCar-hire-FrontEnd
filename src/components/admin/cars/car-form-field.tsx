import { Input } from "@/components/ui/input"

interface CarFormFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

export function CarFormField({ label, value, onChange, type = "text", placeholder, required, disabled }: CarFormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-navy mb-1.5">{label}</label>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`h-10 ${disabled ? "bg-off-white text-muted-foreground cursor-default" : ""}`}
        required={required}
        disabled={disabled}
      />
    </div>
  )
}
