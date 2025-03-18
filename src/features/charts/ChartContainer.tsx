"use client";

import * as React from "react";

export type ChartConfig = {
  [key: string]: {
    label: string;
    color: string;
  };
};

export function ChartContainer({
  config,
  children,
  className,
  ...props
}: React.PropsWithChildren & {
  config: ChartConfig;
  className?: string;
  [key: string]: any;
}) {
  const createCSSVariable = (obj: Record<string, string>) => {
    return Object.entries(obj).reduce((vars, [key, value]) => {
      return {
        ...vars,
        [`--color-${key}`]: value,
      };
    }, {});
  };

  const colors = Object.entries(config).reduce((colors, [key, item]) => {
    return {
      ...colors,
      [key]: item.color,
    };
  }, {});

  const cssVars = createCSSVariable(colors);

  return (
    <div style={cssVars} className={className} {...props}>
      {children}
    </div>
  );
}