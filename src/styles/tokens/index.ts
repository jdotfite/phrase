// styles/tokens/index.ts
export { default as colors } from './colors';
export { default as typography } from './typography';
export { default as spacing } from './spacing';
export { default as shadows } from './shadows';
export { default as animations } from './animations';

// Centralizing export of all tokens
const tokens = {
  colors,
  typography,
  spacing,
  shadows,
  animations,
};

export default tokens;
