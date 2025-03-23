// styles/tokens/animations.ts
export const animations = {
  // Durations
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
  },
  
  // Easing functions
  easing: {
    // Common easing curves
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    
    // Material-inspired easings
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)', // Standard material easing
    accelerate: 'cubic-bezier(0.4, 0.0, 1.0, 1.0)', // For elements exiting screen
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)', // For elements entering screen
    sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1.0)', // For elements changing state
  },
  
  // Animation keyframes (reference to CSS keyframes)
  keyframes: {
    fadeIn: 'fadeIn',
    fadeOut: 'fadeOut',
    slideIn: 'slideIn',
    slideOut: 'slideOut',
    zoomIn: 'zoomIn',
    zoomOut: 'zoomOut',
  },
  
  // Prebuilt animations
  animation: {
    fadeIn: 'fadeIn var(--animation-duration-normal) var(--animation-easing-out) forwards',
    fadeOut: 'fadeOut var(--animation-duration-normal) var(--animation-easing-in) forwards',
    slideIn: 'slideIn var(--animation-duration-normal) var(--animation-easing-out) forwards',
    slideOut: 'slideOut var(--animation-duration-normal) var(--animation-easing-in) forwards',
    zoomIn: 'zoomIn var(--animation-duration-normal) var(--animation-easing-out) forwards',
    zoomOut: 'zoomOut var(--animation-duration-normal) var(--animation-easing-in) forwards',
  },
}

export default animations;
