import { CarCondition, CustomerResponseStatus } from "@/types"
import { cn } from "@/lib/utils"

export function CustomerResponseBadge({ value, adminView = false }: { value: CustomerResponseStatus; adminView?: boolean }) {
  const map: Record<CustomerResponseStatus, { label: string; adminLabel: string; cls: string }> = {
    PENDING:   { label: "Awaiting Your Response", adminLabel: "Awaiting Customer Response", cls: "bg-warning/10 text-warning border-warning/30" },
    CONFIRMED: { label: "Confirmed",              adminLabel: "Confirmed",                  cls: "bg-success/10 text-success border-success/30" },
    REJECTED:  { label: "Disputed",               adminLabel: "Disputed by Customer",       cls: "bg-danger/10  text-danger  border-danger/30"  },
  }
  const { label, adminLabel, cls } = map[value]
  return (
    <span className={cn("inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border", cls)}>
      {adminView ? adminLabel : label}
    </span>
  )
}

export function ConditionBadge({ value }: { value: CarCondition }) {
  const map: Record<CarCondition, { label: string; cls: string }> = {
    EXCELLENT: { label: "Excellent", cls: "bg-success/10 text-success border-success/30" },
    GOOD:      { label: "Good",      cls: "bg-royal/10  text-royal  border-royal/30"  },
    FAIR:      { label: "Fair",      cls: "bg-warning/10 text-warning border-warning/30" },
    POOR:      { label: "Poor",      cls: "bg-danger/10  text-danger  border-danger/30"  },
  }
  const { label, cls } = map[value]
  return (
    <span className={cn("inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border", cls)}>
      {label}
    </span>
  )
}
