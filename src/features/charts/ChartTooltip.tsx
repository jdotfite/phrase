"use client";

import * as React from "react";
import { Tooltip } from "recharts";

export function ChartTooltip({
  content,
  ...props
}: {
  content?: React.JSXElementConstructor<any>;
  [key: string]: any;
}) {
  return <Tooltip {...props} content={content} />;
}
