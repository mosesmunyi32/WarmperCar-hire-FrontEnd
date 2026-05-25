"use client"

import { useState } from "react"
import * as Popover from "@radix-ui/react-popover"
import { DayPicker, type DateRange } from "react-day-picker"
import { format, differenceInCalendarDays } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onRangeChange: (start: string, end: string) => void
  bookedRanges?: { startDate: string; endDate: string }[]
  defaultOpen?: boolean
  className?: string
}

function toLocalDateTime(date: Date, hour: string, minute: string): string {
  return format(date, "yyyy-MM-dd") + `T${hour}:${minute}:00`
}

function parseHour(iso: string): string {
  return iso && iso.length >= 16 ? iso.slice(11, 13) : "08"
}

function parseMinute(iso: string): string {
  return iso && iso.length >= 16 ? iso.slice(14, 16) : "00"
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))
const MINUTES = ["00", "15", "30", "45"]

const selectCls =
  "h-8 rounded-lg border border-input bg-background px-2 text-sm font-medium text-navy focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"

export function DateRangePicker({
  startDate,
  endDate,
  onRangeChange,
  bookedRanges = [],
  defaultOpen = false,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [startHour, setStartHour] = useState(() => parseHour(startDate))
  const [startMin, setStartMin] = useState(() => parseMinute(startDate))
  const [endHour, setEndHour] = useState(() => parseHour(endDate))
  const [endMin, setEndMin] = useState(() => parseMinute(endDate))

  const from = startDate ? new Date(startDate) : undefined
  const to = endDate ? new Date(endDate) : undefined
  const selected: DateRange = { from, to }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const blockedRanges: DateRange[] = bookedRanges
    .map((r) => {
      const end = new Date(r.endDate)
      if (end < today) return null
      const start = new Date(r.startDate)
      return { from: start < today ? today : start, to: end }
    })
    .filter(Boolean) as DateRange[]

  const days =
    from && to
      ? Math.max(0, differenceInCalendarDays(to, from))
      : 0

  const phase: "start" | "end" | "time" =
    !from ? "start" : !to ? "end" : "time"

  const hint =
    phase === "start"
      ? "Select pick-up date"
      : phase === "end"
      ? "Now select return date — calendar stays open"
      : "Set exact pick-up & return times below"

  const label =
    from && to
      ? `${format(from, "MMM d, HH:mm")} → ${format(to, "MMM d, HH:mm")}`
      : from
      ? `${format(from, "MMM d, yyyy")} → select return…`
      : undefined

  const handleSelectDates = (range: DateRange | undefined) => {
    if (!range) return
    const newFrom = range.from
    const newTo = range.to
    const start = newFrom ? toLocalDateTime(newFrom, startHour, startMin) : ""
    const end = newTo ? toLocalDateTime(newTo, endHour, endMin) : ""
    onRangeChange(start, end)
    // Do NOT close — let user set times or select end date
  }

  const handleStartHour = (h: string) => {
    setStartHour(h)
    if (from) onRangeChange(toLocalDateTime(from, h, startMin), endDate)
  }
  const handleStartMin = (m: string) => {
    setStartMin(m)
    if (from) onRangeChange(toLocalDateTime(from, startHour, m), endDate)
  }
  const handleEndHour = (h: string) => {
    setEndHour(h)
    if (to) onRangeChange(startDate, toLocalDateTime(to, h, endMin))
  }
  const handleEndMin = (m: string) => {
    setEndMin(m)
    if (to) onRangeChange(startDate, toLocalDateTime(to, endHour, m))
  }

  const handleConfirm = () => setOpen(false)

  const handleClear = () => {
    onRangeChange("", "")
    setStartHour("08"); setStartMin("00")
    setEndHour("08");   setEndMin("00")
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
          {label ?? "Select pick-up → return dates & times"}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}

          className="z-50 rounded-xl border border-light-gray bg-white shadow-xl p-4 animate-in fade-in-0 zoom-in-95 w-auto"
        >
          {/* Hint */}
          <p className={cn(
            "text-xs font-semibold mb-3 px-1 flex items-center gap-1.5",
            phase === "start" ? "text-muted-foreground"
              : phase === "end" ? "text-royal"
              : "text-gold"
          )}>
            {phase === "time" && <Clock className="h-3.5 w-3.5" />}
            {hint}
          </p>

          {/* Calendar */}
          <DayPicker
            mode="range"
            selected={selected}
            onSelect={handleSelectDates}
            numberOfMonths={2}
            disabled={[{ before: new Date() }, ...blockedRanges]}
            modifiers={{ booked: blockedRanges }}
            modifiersStyles={{
              booked: {
                backgroundColor: "rgb(254 226 226)",
                color: "rgb(185 28 28)",
                fontWeight: "600",
                borderRadius: "6px",
                cursor: "not-allowed",
              },
            }}
            defaultMonth={from ?? new Date()}
            showOutsideDays
            classNames={{
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
              range_start: "[&>button]:bg-navy [&>button]:text-white [&>button]:rounded-lg after:absolute after:inset-y-0 after:right-0 after:left-1/2 after:bg-royal/20 after:-z-0",
              range_end: "[&>button]:bg-navy [&>button]:text-white [&>button]:rounded-lg after:absolute after:inset-y-0 after:left-0 after:right-1/2 after:bg-royal/20 after:-z-0",
              range_middle: "bg-royal/15 [&>button]:rounded-none [&>button]:hover:bg-royal/25 [&>button]:text-navy",
              selected: "[&>button]:bg-navy [&>button]:text-white",
              today: "[&>button]:border-2 [&>button]:border-gold [&>button]:font-semibold [&>button]:text-navy",
              outside: "[&>button]:text-muted-foreground [&>button]:opacity-40",
              disabled: "[&>button]:opacity-30 [&>button]:cursor-not-allowed [&>button]:hover:bg-transparent",
            }}
            components={{
              Chevron: ({ orientation }) =>
                orientation === "left"
                  ? <ChevronLeft className="h-3.5 w-3.5" />
                  : <ChevronRight className="h-3.5 w-3.5" />,
              DayButton: ({ children, className, modifiers, ...props }) =>
                modifiers.booked ? (
                  <div className="relative group/bday inline-flex">
                    <button className={className} {...props}>{children}</button>
                    <span className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 z-50 hidden group-hover/bday:flex flex-col items-center">
                      <span className="rounded-lg bg-navy px-2.5 py-1.5 text-[10px] text-white whitespace-nowrap shadow-lg leading-snug">
                        This car is already booked
                      </span>
                      <span className="border-x-[5px] border-t-[5px] border-x-transparent border-t-navy" />
                    </span>
                  </div>
                ) : (
                  <button className={className} {...props}>{children}</button>
                ),
            }}
          />

          {/* Legend */}
          {bookedRanges.length > 0 && (
            <div className="flex flex-wrap items-center gap-4 mt-3 px-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3.5 w-3.5 rounded bg-royal/20 border border-royal/30" />
                Your selection
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3.5 w-3.5 rounded bg-red-100 border border-red-300" />
                Already booked
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3.5 w-3.5 rounded border-2 border-gold" />
                Today
              </span>
            </div>
          )}

          {/* Time pickers — only shown when both dates are selected */}
          {from && to && (
            <div className="mt-4 pt-4 border-t border-light-gray">
              <div className="grid grid-cols-2 gap-4">
                {/* Pick-up time */}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-royal" /> Pick-up time
                  </p>
                  <p className="text-xs text-navy font-medium mb-2">
                    {format(from, "EEE, MMM d")}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={startHour}
                      onChange={(e) => handleStartHour(e.target.value)}
                      className={selectCls}
                    >
                      {HOURS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="text-navy font-bold">:</span>
                    <select
                      value={startMin}
                      onChange={(e) => handleStartMin(e.target.value)}
                      className={selectCls}
                    >
                      {MINUTES.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Return time */}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-gold" /> Return time
                  </p>
                  <p className="text-xs text-navy font-medium mb-2">
                    {format(to, "EEE, MMM d")}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={endHour}
                      onChange={(e) => handleEndHour(e.target.value)}
                      className={selectCls}
                    >
                      {HOURS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="text-navy font-bold">:</span>
                    <select
                      value={endMin}
                      onChange={(e) => handleEndMin(e.target.value)}
                      className={selectCls}
                    >
                      {MINUTES.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Summary + actions */}
              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold text-navy">{days} day{days !== 1 ? "s" : ""}</span>
                  {" · "}
                  {format(from, "MMM d HH:mm")} → {format(to, "MMM d HH:mm")}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-xs text-danger hover:underline"
                  >
                    Clear
                  </button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleConfirm}
                    className="bg-navy hover:bg-royal text-white h-8 px-4 text-xs"
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
