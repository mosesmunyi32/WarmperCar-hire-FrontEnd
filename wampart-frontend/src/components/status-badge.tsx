import { cn } from "@/lib/utils"

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-success/10 text-success border border-success/20",
  APPROVED: "bg-success/10 text-success border border-success/20",
  ACTIVE: "bg-success/10 text-success border border-success/20",
  AVAILABLE: "bg-success/10 text-success border border-success/20",
  PENDING: "bg-warning/10 text-warning border border-warning/20",
  PENDING_APPROVAL: "bg-warning/10 text-warning border border-warning/20",
  CANCELLED: "bg-danger/10 text-danger border border-danger/20",
  REJECTED: "bg-danger/10 text-danger border border-danger/20",
  UNDER_MAINTENANCE: "bg-purple/10 text-purple border border-purple/20",
  COMPLETED: "bg-azure/10 text-azure border border-azure/20",
  INACTIVE: "bg-gray-100 text-gray-500 border border-gray-200",
}

export function StatusBadge({ status }: { status: string | null | undefined }) {
  const label = status ?? "UNKNOWN"
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        STATUS_STYLES[label] ?? "bg-gray-100 text-gray-600 border border-gray-200"
      )}
    >
      {label.replace(/_/g, " ")}
    </span>
  )
}
