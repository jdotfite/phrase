// lib/theme-utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type ThemeVariants<T> = Record<string, T>;

export function themeCn<T>(variants: ThemeVariants<T>, variant: string): T {
  return variants[variant] || variants.default;
}

export function getThemeValue(obj: any, path: string, fallback?: any): any {
  return path.split('.').reduce((o, p) => (o ? o[p] : undefined), obj) || fallback;
}

export function getCssVar(name: string, fallback?: string): string {
  if (typeof window === 'undefined') return fallback || '';
  
  const style = getComputedStyle(document.documentElement);
  const value = style.getPropertyValue(name).trim();
  
  return value || fallback || '';
}
