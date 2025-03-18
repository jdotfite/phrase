// components/ui/stat-card.tsx
import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    label: string
    direction: "up" | "down" | "neutral"
  }
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
  ...props
}: StatCardProps) {
  const trendColors = {
    up: "text-green-500",
    down: "text-red-500",
    neutral: "text-gray-500",
  }

  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className={cn("flex items-center text-xs mt-1", trendColors[trend.direction])}>
            {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→"}
            <span className="ml-1">{trend.value}%</span>
            <span className="ml-1 text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}