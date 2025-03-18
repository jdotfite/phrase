"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

/**
 * Hook for using the theme
 * @returns Theme utilities including theme, setTheme, and systemTheme
 */
export function useTheme() {
  const { theme, setTheme, systemTheme } = React.useContext(
    // @ts-ignore - This context does exist in next-themes
    require("next-themes").ThemeContext
  )
  
  return { 
    theme, 
    setTheme, 
    systemTheme,
    toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark")
  }
}