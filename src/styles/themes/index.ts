// styles/themes/index.ts
export { default as lightTheme } from './light';
export { default as darkTheme } from './dark';

// Export theme object for easy consumption
import lightTheme from './light';
import darkTheme from './dark';

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

export default themes;
