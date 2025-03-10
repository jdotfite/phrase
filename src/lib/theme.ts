// lib/theme.ts

export const theme = {
  colors: {
    primary: {
      50: 'var(--primary-50)',
      100: 'var(--primary-100)',
      // ... other shades
      500: 'var(--primary-500)',
      600: 'var(--primary-600)',
      700: 'var(--primary-700)',
    },
    gray: {
      50: 'var(--gray-50)',
      100: 'var(--gray-100)',
      // ... other shades
      800: 'var(--gray-800)',
      900: 'var(--gray-900)',
    },
    // Add other color palettes (error, warning, etc.)
  },
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    // ... other spacing values
  },
  borderRadius: {
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.5rem',
    xl: '1rem',
  },
  // ... other design tokens
}

export type Theme = typeof theme;