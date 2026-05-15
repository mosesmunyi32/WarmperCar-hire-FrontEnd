"use client"

import { useState } from "react"
import * as Popover from "@radix-ui/react-popover"
import { DayPicker, type DateRange } from "react-day-picker"
import { format, differenceInCalendarDays } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onRangeChange: (start: string, end: string) => void
  className?: string
}

function toLocalDateTime(date: Date): string {
  return format(date, "yyyy-MM-dd") + "T00:00:00"
}

export function DateRangePicker({
  startDate,
  endDate,
  onRangeChange,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)

  const from = startDate ? new Date(startDate) : undefined
  const to = endDate ? new Date(endDate) : undefined
  const selected: DateRange = { from, to }

  const days = from && to ? differenceInCalendarDays(to, from) : 0

  const handleSelect = (range: DateRange | undefined) => {
    if (!range) return
    const start = range.from ? toLocalDateTime(range.from) : ""
    const end = range.to ? toLocalDateTime(range.to) : ""
    onRangeChange(start, end)
    if (range.from && range.to) setOpen(false)
  }

  const hint = !from
    ? "Select pick-up date"
    : !to
    ? "Now select return date"
    : `${days} day${days !== 1 ? "s" : ""} selected`

  const label = from && to
    ? `${format(from, "MMM d")} → ${format(to, "MMM d, yyyy")}  ·  ${days}d`
    : from
    ? `${format(from, "MMM d, yyyy")} → ...`
    : undefined

  const dayClassNames = {
    months: "flex gap-5",
    month: "flex flex-col gap-3",
    month_caption: "flex items-center justify-between px-1",
    caption_label: "text-sm font-semibold text-navy",
    nav: "flex items-center gap-1",
    button_previous: cn(
      "h-7 w-7 rounded-md border border-light-gray flex items-center justify-center",
      "hover:bg-navy hover:text-white hover:border-navy transition-colors text-muted-foreground"
    ),
    button_next: cn(
      "h-7 w-7 rounded-md border border-light-gray flex items-center justify-center",
      "hover:bg-navy hover:text-white hover:border-navy transition-colors text-muted-foreground"
    ),
    month_grid: "w-full border-collapse",
    weekdays: "flex",
    weekday: "w-9 text-center text-xs font-medium text-muted-foreground py-1",
    week: "flex mt-1",
    day: "w-9 h-9 text-center p-0 relative",
    day_button: cn(
      "w-9 h-9 rounded-lg text-sm flex items-center justify-center transition-colors relative z-10",
      "hover:bg-navy/10 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    ),
    range_start: "[&>button]:bg-navy [&>button]:text-white [&>button]:rounded-lg after:absolute after:inset-y-0 after:right-0 after:left-1/2 after:bg-royal/15 after:-z-0",
    range_end: "[&>button]:bg-navy [&>button]:text-white [&>button]:rounded-lg after:absolute after:inset-y-0 after:left-0 after:right-1/2 after:bg-royal/15 after:-z-0",
    range_middle: "bg-royal/15 [&>button]:rounded-none [&>button]:hover:bg-royal/20",
    selected: "[&>button]:bg-navy [&>button]:text-white",
    today: "[&>button]:border [&>button]:border-royal [&>button]:font-semibold [&>button]:text-royal",
    outside: "[&>button]:text-muted-foreground [&>button]:opacity-40",
    disabled: "[&>button]:opacity-30 [&>button]:cursor-not-allowed [&>button]:hover:bg-transparent",
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            "w-full h-11 flex items-center gap-2 px-3 rounded-lg border border-input bg-background text-sm text-left",
            "hover:border-ring transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            !label && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
          {label ?? "Select pick-up → return dates"}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-50 rounded-xl border border-light-gray bg-white shadow-xl p-4 animate-in fade-in-0 zoom-in-95"
        >
          <p className={cn(
            "text-xs font-medium mb-3 px-1",
            !from ? "text-muted-foreground" : !to ? "text-royal" : "text-success"
          )}>
            {hint}
          </p>
          <DayPicker
            mode="range"
            selected={selected}
            onSelect={handleSelect}
            numberOfMonths={2}
            disabled={{ before: new Date() }}
            defaultMonth={from ?? new Date()}
            showOutsideDays
            classNames={dayClassNames}
            components={{
              Chevron: ({ orientation }) =>
                orientation === "left"
                  ? <ChevronLeft className="h-3.5 w-3.5" />
                  : <ChevronRight className="h-3.5 w-3.5" />,
            }}
          />
          {from && to && (
            <div className="mt-3 pt-3 border-t border-light-gray flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>{format(from, "EEE, MMM d")} → {format(to, "EEE, MMM d, yyyy")}</span>
              <button
                type="button"
                onClick={() => onRangeChange("", "")}
                className="text-danger hover:underline"
              >
                Clear
              </button>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
