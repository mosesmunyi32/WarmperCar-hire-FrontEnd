"use client"

import { useState } from "react"
import * as Popover from "@radix-ui/react-popover"
import { DayPicker } from "react-day-picker"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value: string
  onChange: (isoValue: string) => void
  placeholder?: string
  className?: string
  /** Earliest selectable year (default 1930) */
  fromYear?: number
  /** Latest selectable year (default: 16 years ago — suitable for DOB) */
  toYear?: number
}

const selectClass = cn(
  "h-8 rounded-lg border border-input bg-background px-2 pr-7 text-sm font-semibold text-navy",
  "focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer",
  "appearance-none bg-[url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")] bg-no-repeat bg-[right_6px_center]"
)

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className,
  fromYear = 1930,
  toYear = new Date().getFullYear() - 16,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)

  const selected = value ? new Date(value) : undefined

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, "yyyy-MM-dd") + "T00:00:00")
      setOpen(false)
    }
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            "w-full h-11 flex items-center gap-2 px-3 rounded-lg border border-input bg-background text-sm text-left",
            "hover:border-ring transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            !selected && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
          {selected ? format(selected, "MMMM d, yyyy") : placeholder}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-50 rounded-xl border border-light-gray bg-white shadow-xl p-4 animate-in fade-in-0 zoom-in-95"
        >
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            captionLayout="dropdown"
            startMonth={new Date(fromYear, 0)}
            endMonth={new Date(toYear, 11)}
            reverseYears
            numberOfMonths={1}
            disabled={{ after: new Date() }}
            defaultMonth={selected ?? new Date(toYear - 5, 0)}
            showOutsideDays
            classNames={{
              months: "flex flex-col gap-3",
              month: "flex flex-col gap-3",
              month_caption: "flex items-center justify-center px-1 pb-1",
              dropdowns: "flex items-center gap-2",
              dropdown_root: "relative",
              months_dropdown: selectClass,
              years_dropdown: selectClass,
              dropdown: selectClass,
              nav: "hidden",
              caption_label: "hidden",
              month_grid: "w-full border-collapse",
              weekdays: "flex",
              weekday: "w-9 text-center text-xs font-medium text-muted-foreground py-1",
              week: "flex mt-1",
              day: "w-9 h-9 text-center p-0",
              day_button: cn(
                "w-9 h-9 rounded-lg text-sm flex items-center justify-center transition-colors",
                "hover:bg-navy/10 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              ),
              selected: "[&>button]:bg-navy [&>button]:text-white [&>button]:hover:bg-royal",
              today: "[&>button]:border [&>button]:border-royal [&>button]:font-semibold [&>button]:text-royal",
              outside: "[&>button]:text-muted-foreground [&>button]:opacity-40",
              disabled: "[&>button]:opacity-30 [&>button]:cursor-not-allowed [&>button]:hover:bg-transparent",
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
