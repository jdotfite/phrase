// styles/theme.ts
import { themes } from './themes';
import * as tokens from './tokens';

// Re-export everything
export { themes, tokens };
export * from './themes';
export * from './tokens';

// Utility functions for theme
export function getThemeValue(themeName: 'light' | 'dark' | string, path: string) {
  const theme = themes[themeName] || themes.light;
  return path.split('.').reduce((obj, key) => obj?.[key], theme);
}

export function getCssVar(name: string, fallback?: string) {
  if (typeof window === 'undefined') return fallback;
  const variable = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return variable || fallback;
}

export default {
  themes,
  tokens,
  getThemeValue,
  getCssVar,
};
