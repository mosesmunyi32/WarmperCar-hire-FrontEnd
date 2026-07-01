import { UserPlus, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { BookingMode } from "./types"

export function ModeToggle({
  mode,
  onSwitch,
}: {
  mode: BookingMode
  onSwitch: (m: BookingMode) => void
}) {
  return (
    <div className="flex gap-3 mb-8">
      <button
        onClick={() => onSwitch("new")}
        className={cn(
          "flex items-center gap-2.5 px-5 py-3 rounded-xl border text-sm font-medium transition-colors flex-1 justify-center",
          mode === "new"
            ? "bg-navy text-white border-navy"
            : "bg-white border-light-gray text-muted-foreground hover:border-navy/30 hover:text-navy"
        )}
      >
        <UserPlus className="h-4 w-4 shrink-0" />
        <div className="text-left">
          <p className="font-semibold leading-none">New Customer</p>
          <p className={cn("text-xs mt-0.5", mode === "new" ? "text-white/70" : "text-muted-foreground")}>
            Register & book
          </p>
        </div>
      </button>
      <button
        onClick={() => onSwitch("existing")}
        className={cn(
          "flex items-center gap-2.5 px-5 py-3 rounded-xl border text-sm font-medium transition-colors flex-1 justify-center",
          mode === "existing"
            ? "bg-navy text-white border-navy"
            : "bg-white border-light-gray text-muted-foreground hover:border-navy/30 hover:text-navy"
        )}
      >
        <Users className="h-4 w-4 shrink-0" />
        <div className="text-left">
          <p className="font-semibold leading-none">Existing Customer</p>
          <p className={cn("text-xs mt-0.5", mode === "existing" ? "text-white/70" : "text-muted-foreground")}>
            Book for registered user
          </p>
        </div>
      </button>
    </div>
  )
}
