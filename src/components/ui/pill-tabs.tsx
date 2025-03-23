'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';
import { useTheme } from '@/providers/ThemeContext';

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
  const { accent } = useTheme();
  
  // Get accent-specific colors
  const getAccentStyles = () => {
    switch (accent) {
      case 'blue':
        return {
          active: 'bg-blue-100 text-blue-900 dark:bg-blue-800/30 dark:text-blue-100',
          inactive: 'text-muted-foreground hover:text-blue-900 dark:hover:text-blue-300'
        };
      case 'green':
        return {
          active: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-800/30 dark:text-emerald-100',
          inactive: 'text-muted-foreground hover:text-emerald-900 dark:hover:text-emerald-300'
        };
      case 'purple':
        return {
          active: 'bg-purple-100 text-purple-900 dark:bg-purple-800/30 dark:text-purple-100',
          inactive: 'text-muted-foreground hover:text-purple-900 dark:hover:text-purple-300'
        };
      case 'orange':
        return {
          active: 'bg-orange-100 text-orange-900 dark:bg-orange-800/30 dark:text-orange-100',
          inactive: 'text-muted-foreground hover:text-orange-900 dark:hover:text-orange-300'
        };
      default: // grayscale
        return {
          active: 'bg-muted text-foreground',
          inactive: 'text-muted-foreground hover:text-foreground'
        };
    }
  };
  
  const styles = getAccentStyles();

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
                ? styles.active
                : styles.inactive
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

// Standard tabs component with accent colors
export function Tabs({ defaultValue, value, onValueChange, className, children, ...props }: TabsPrimitive.TabsProps) {
  return (
    <TabsPrimitive.Root
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      className={cn("w-full", className)}
      {...props}
    >
      {children}
    </TabsPrimitive.Root>
  );
}

export function TabsList({ className, children, ...props }: TabsPrimitive.TabsListProps) {
  const { accent } = useTheme();
  
  // Get accent-specific background
  const getBackgroundClass = () => {
    switch (accent) {
      case 'blue':
        return 'bg-blue-100/50 dark:bg-blue-900/20';
      case 'green':
        return 'bg-emerald-100/50 dark:bg-emerald-900/20';
      case 'purple':
        return 'bg-purple-100/50 dark:bg-purple-900/20';
      case 'orange':
        return 'bg-orange-100/50 dark:bg-orange-900/20';
      default: // grayscale
        return 'bg-muted';
    }
  };

  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md p-1 text-muted-foreground",
        getBackgroundClass(),
        className
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.List>
  );
}

export function TabsTrigger({ className, children, ...props }: TabsPrimitive.TabsTriggerProps) {
  const { accent } = useTheme();
  
  // Get accent-specific active state
  const getActiveClass = () => {
    switch (accent) {
      case 'blue':
        return 'data-[state=active]:bg-white data-[state=active]:text-blue-700 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-blue-400';
      case 'green':
        return 'data-[state=active]:bg-white data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-emerald-400';
      case 'purple':
        return 'data-[state=active]:bg-white data-[state=active]:text-purple-700 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-purple-400';
      case 'orange':
        return 'data-[state=active]:bg-white data-[state=active]:text-orange-700 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-orange-400';
      default: // grayscale
        return 'data-[state=active]:bg-background data-[state=active]:text-foreground';
    }
  };

  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        getActiveClass(),
        "data-[state=active]:shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}

export function TabsContent({ className, children, ...props }: TabsPrimitive.TabsContentProps) {
  return (
    <TabsPrimitive.Content
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Content>
  );
}