// components/ui/chart.tsx
"use client"

import * as React from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { useTheme } from "@/providers/ThemeContext"

export type ChartConfig = {
  [key: string]: {
    label: string
    color?: string
  }
}

interface ChartContainerProps {
  config: ChartConfig
  children: React.ReactNode
  className?: string
  [key: string]: any
}

export function ChartContainer({
  config,
  children,
  className,
  ...props
}: ChartContainerProps) {
  const { accent } = useTheme();
  
  // Get colors based on current accent
  const getChartColors = () => {
    const colorKeys = Object.keys(config);
    
    // Generate accent-specific colors
    let colors: Record<string, string> = {};
    
    switch (accent) {
      case 'blue':
        colors = colorKeys.reduce((obj, key, index) => ({
          ...obj,
          [key]: `hsl(${220 + (index * 30)}, 70%, ${50 - (index * 5)}%)`
        }), {});
        break;
      case 'green':
        colors = colorKeys.reduce((obj, key, index) => ({
          ...obj,
          [key]: `hsl(${160 + (index * 30)}, 60%, ${45 - (index * 5)}%)`
        }), {});
        break;
      case 'purple':
        colors = colorKeys.reduce((obj, key, index) => ({
          ...obj,
          [key]: `hsl(${270 + (index * 30)}, 60%, ${50 - (index * 5)}%)`
        }), {});
        break;
      case 'orange':
        colors = colorKeys.reduce((obj, key, index) => ({
          ...obj,
          [key]: `hsl(${30 + (index * 30)}, 80%, ${50 - (index * 5)}%)`
        }), {});
        break;
      default: // grayscale
        colors = colorKeys.reduce((obj, key, index) => ({
          ...obj,
          [key]: `hsl(0, 0%, ${50 - (index * 5)}%)`
        }), {});
        break;
    }
    
    // Override with manual colors if specified in config
    colorKeys.forEach(key => {
      if (config[key].color) {
        colors[key] = config[key].color!;
      }
    });
    
    return colors;
  };

  const chartColors = getChartColors();

  const createCSSVariable = (obj: Record<string, string>) => {
    return Object.entries(obj).reduce((vars, [key, value]) => {
      return {
        ...vars,
        [`--color-${key}`]: value,
      }
    }, {})
  }

  const cssVars = createCSSVariable(chartColors)

  return (
    <div style={cssVars} className={className} {...props}>
      {children}
    </div>
  )
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: any[]
  label?: string
  config?: ChartConfig
  indicator?: "circle" | "line"
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  config,
  indicator = "circle",
}: ChartTooltipContentProps) {
  const { accent } = useTheme();
  
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

  // Get accent-specific background
  const getTooltipBackground = () => {
    switch (accent) {
      case 'blue':
        return 'bg-blue-950/90 border-blue-700';
      case 'green':
        return 'bg-emerald-950/90 border-emerald-700';
      case 'purple':
        return 'bg-purple-950/90 border-purple-700';
      case 'orange':
        return 'bg-orange-950/90 border-orange-700';
      default: // grayscale
        return 'bg-gray-950/90 border-gray-700';
    }
  };

  return (
    <div className={`rounded-lg border ${getTooltipBackground()} p-2 shadow-sm`}>
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

export function SimpleAreaChart({
  data,
  dataKey,
  height = 200,
  className,
}: {
  data: any[]
  dataKey: string
  height?: number
  className?: string
}) {
  const { accent } = useTheme();
  
  // Get accent-specific color
  const getStrokeColor = () => {
    switch (accent) {
      case 'blue': return "#3B82F6";
      case 'green': return "#10B981";
      case 'purple': return "#8B5CF6";
      case 'orange': return "#F97316";
      default: return "#6B7280"; // grayscale
    }
  };
  
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={getStrokeColor()}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SimpleBarChart({
  data,
  dataKey,
  height = 200,
  className,
}: {
  data: any[]
  dataKey: string
  categoryKey?: string
  height?: number
  className?: string
}) {
  const { accent } = useTheme();
  
  // Get accent-specific fill color
  const getFillColor = () => {
    switch (accent) {
      case 'blue': return "#3B82F6";
      case 'green': return "#10B981";
      case 'purple': return "#8B5CF6";
      case 'orange': return "#F97316";
      default: return "#6B7280"; // grayscale
    }
  };
  
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey={dataKey} fill={getFillColor()} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}