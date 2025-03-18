'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

interface PillTabsProps {
  tabs: Array<{
    value: string;
    label: string;
  }>;
  activeTab: string;
  onTabChange: (value: string) => void;
  className?: string;
}

export function PillTabs({ tabs, activeTab, onTabChange, className }: PillTabsProps) {
  return (
    <div className={cn("relative overflow-auto", className)}>
      <div className="flex items-center">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={cn(
              "flex h-9 items-center justify-center rounded-full px-4 text-center text-sm font-medium transition-colors",
              activeTab === tab.value
                ? "bg-muted text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface PillTabsContentProps {
  value: string;
  activeTab: string;
  children: React.ReactNode;
  className?: string;
}

export function PillTabsContent({ value, activeTab, children, className }: PillTabsContentProps) {
  if (value !== activeTab) return null;
  
  return (
    <div className={cn("mt-4", className)}>
      {children}
    </div>
  );
}