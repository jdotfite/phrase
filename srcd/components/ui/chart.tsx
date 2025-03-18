// components/ui/chart.tsx

"use client"

import * as React from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts"

export type ChartConfig = {
  [key: string]: {
    label: string
    color: string
  }
}

export function ChartContainer({
  config,
  children,
  className,
  ...props
}: React.PropsWithChildren & {
  config: ChartConfig
  className?: string
  [key: string]: any
}) {
  const createCSSVariable = (obj: Record<string, string>) => {
    return Object.entries(obj).reduce((vars, [key, value]) => {
      return {
        ...vars,
        [`--color-${key}`]: value,
      }
    }, {})
  }

  const colors = Object.entries(config).reduce((colors, [key, item]) => {
    return {
      ...colors,
      [key]: item.color,
    }
  }, {})

  const cssVars = createCSSVariable(colors)

  return (
    <div style={cssVars} className={className} {...props}>
      {children}
    </div>
  )
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  config,
  indicator = "circle",
}: {
  active?: boolean
  payload?: any[]
  label?: string
  config?: ChartConfig
  indicator?: "circle" | "line"
}) {
  const TypeIndicator = ({ name }: { name: string }) =>
    indicator === "circle" ? (
      <circle
        cx="6.5"
        cy="6.5"
        r="3.5"
        fill={`var(--color-${name})`}
      />
    ) : (
      <line
        x1="1"
        y1="6.5"
        x2="9"
        y2="6.5"
        stroke={`var(--color-${name})`}
        strokeWidth={2}
        strokeLinecap="round"
      />
    )

  if (!active || !payload) return null

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col">
          <span className="text-[0.70rem] uppercase text-muted-foreground">
            {label}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          {payload.map(({ value, name }) => (
            <div key={name} className="flex items-center justify-end gap-1">
              <span className="text-[0.70rem] text-muted-foreground">
                {config?.[name]?.label ?? name}
              </span>
              <span className="font-bold tabular-nums">{value}</span>
              {config?.[name] && (
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 13 13"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <TypeIndicator name={name} />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ChartTooltip({
  content,
  ...props
}: {
  content?: React.JSXElementConstructor<any>
  [key: string]: any
}) {
  return <Tooltip {...props} content={content} />
}