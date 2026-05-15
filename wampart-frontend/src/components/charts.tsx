"use client"

interface BarChartProps {
  data: { label: string; value: number; color?: string }[]
  height?: number
}

export function BarChart({ data, height = 160 }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-xs text-muted-foreground font-medium">{d.value}</span>
          <div
            className="w-full rounded-t-md transition-all"
            style={{
              height: `${(d.value / max) * (height - 32)}px`,
              backgroundColor: d.color ?? "#1E3A8A",
            }}
          />
          <span className="text-xs text-muted-foreground truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

interface HorizontalBarProps {
  data: { label: string; value: number; color?: string }[]
}

export function HorizontalBar({ data }: HorizontalBarProps) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="flex flex-col gap-3">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="text-sm text-foreground w-24 shrink-0 truncate">{d.label}</span>
          <div className="flex-1 bg-light-gray rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(d.value / max) * 100}%`,
                backgroundColor: d.color ?? "#1E3A8A",
              }}
            />
          </div>
          <span className="text-sm text-muted-foreground w-8 text-right">{d.value}</span>
        </div>
      ))}
    </div>
  )
}

interface LineChartProps {
  data: { label: string; value: number }[]
  color?: string
  height?: number
}

export function LineChart({ data, color = "#2563EB", height = 160 }: LineChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1)
  const min = Math.min(...data.map((d) => d.value), 0)
  const range = max - min || 1
  const w = 300
  const h = height - 24

  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((d.value - min) / range) * h,
  }))

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
  const areaD = `${pathD} L ${points[points.length - 1].x} ${h} L 0 ${h} Z`

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${w} ${h + 24}`} className="w-full" style={{ height }}>
        <defs>
          <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#grad-${color.replace("#", "")})`} />
        <path d={pathD} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
        ))}
        {data.map((d, i) => (
          <text
            key={i}
            x={(i / (data.length - 1)) * w}
            y={h + 16}
            textAnchor="middle"
            fontSize="10"
            fill="#64748b"
          >
            {d.label}
          </text>
        ))}
      </svg>
    </div>
  )
}

interface DonutChartProps {
  data: { label: string; value: number; color: string }[]
  size?: number
}

export function DonutChart({ data, size = 120 }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const r = 40
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r

  let offset = 0
  const slices = data.map((d) => {
    const pct = d.value / total
    const dash = pct * circumference
    const slice = { ...d, dash, offset, pct }
    offset += dash
    return slice
  })

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E2E8F0" strokeWidth="16" />
        {slices.map((s, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="16"
            strokeDasharray={`${s.dash} ${circumference - s.dash}`}
            strokeDashoffset={-s.offset + circumference / 4}
            strokeLinecap="butt"
          />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="14" fontWeight="600" fill="#0A1628">
          {total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#64748b">
          Total
        </text>
      </svg>
      <div className="flex flex-col gap-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-xs text-muted-foreground">{d.label}</span>
            <span className="text-xs font-medium text-foreground ml-auto">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
