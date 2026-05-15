import { CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = ["Customer Account", "Booking Details"]

export function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center gap-2 flex-1">
          <div
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
              i < step
                ? "bg-success text-white"
                : i === step
                ? "bg-navy text-white"
                : "bg-light-gray text-muted-foreground"
            )}
          >
            {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
          </div>
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              i === step ? "text-navy" : i < step ? "text-success" : "text-muted-foreground"
            )}
          >
            {label}
          </span>
          {i < STEPS.length - 1 && (
            <div className={cn("flex-1 h-px mx-2 transition-colors", i < step ? "bg-success/50" : "bg-light-gray")} />
          )}
        </div>
      ))}
    </div>
  )
}
