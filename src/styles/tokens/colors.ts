// styles/tokens/colors.ts
export const colors = {
  // Primary colors
  primary: {
    50: 'hsl(var(--primary-50))',
    100: 'hsl(var(--primary-100))',
    200: 'hsl(var(--primary-200))',
    300: 'hsl(var(--primary-300))',
    400: 'hsl(var(--primary-400))',
    500: 'hsl(var(--primary-500))',
    600: 'hsl(var(--primary-600))',
    700: 'hsl(var(--primary-700))',
    800: 'hsl(var(--primary-800))',
    900: 'hsl(var(--primary-900))',
    950: 'hsl(var(--primary-950))',
  },
  
  // Gray scale
  gray: {
    50: 'hsl(var(--gray-50))',
    100: 'hsl(var(--gray-100))',
    200: 'hsl(var(--gray-200))',
    300: 'hsl(var(--gray-300))',
    400: 'hsl(var(--gray-400))',
    500: 'hsl(var(--gray-500))',
    600: 'hsl(var(--gray-600))',
    700: 'hsl(var(--gray-700))',
    800: 'hsl(var(--gray-800))',
    900: 'hsl(var(--gray-900))',
    950: 'hsl(var(--gray-950))',
  },
  
  // Semantic colors
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  card: 'hsl(var(--card))',
  cardForeground: 'hsl(var(--card-foreground))',
  popover: 'hsl(var(--popover))',
  popoverForeground: 'hsl(var(--popover-foreground))',
  
  // UI component colors
  primary: 'hsl(var(--primary))',
  primaryForeground: 'hsl(var(--primary-foreground))',
  secondary: 'hsl(var(--secondary))',
  secondaryForeground: 'hsl(var(--secondary-foreground))',
  muted: 'hsl(var(--muted))',
  mutedForeground: 'hsl(var(--muted-foreground))',
  accent: 'hsl(var(--accent))',
  accentForeground: 'hsl(var(--accent-foreground))',
  destructive: 'hsl(var(--destructive))',
  destructiveForeground: 'hsl(var(--destructive-foreground))',
  
  // Border and other UI elements
  border: 'hsl(var(--border))',
  input: 'hsl(var(--input))',
  ring: 'hsl(var(--ring))',
  
  // Chart colors
  chart: {
    1: 'hsl(var(--chart-1))',
    2: 'hsl(var(--chart-2))',
    3: 'hsl(var(--chart-3))',
    4: 'hsl(var(--chart-4))',
    5: 'hsl(var(--chart-5))',
  },
  
  // Theme accent colors
  accents: {
    default: {
      color: 'var(--accent-color)',
      foreground: 'var(--accent-foreground)',
      muted: 'var(--accent-muted)',
    },
    blue: {
      color: 'hsl(220 70% 50%)',
      foreground: 'hsl(220 70% 95%)',
      muted: 'hsl(220 70% 30%)',
    },
    green: {
      color: 'hsl(160 60% 45%)',
      foreground: 'hsl(160 60% 95%)',
      muted: 'hsl(160 60% 25%)',
    },
    purple: {
      color: 'hsl(270 60% 50%)',
      foreground: 'hsl(270 60% 95%)',
      muted: 'hsl(270 60% 30%)',
    },
    orange: {
      color: 'hsl(30 80% 50%)',
      foreground: 'hsl(30 80% 95%)',
      muted: 'hsl(30 80% 30%)',
    },
  },
}

export default colors;