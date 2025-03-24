import { useState, useEffect } from 'react';

// Define breakpoints
export const breakpoints = {
  xs: 360,   // Extra small devices
  sm: 640,   // Small devices
  md: 768,   // Medium devices
  lg: 1024,  // Large devices
  xl: 1280,  // Extra large devices
};

export interface ResponsiveData {
  width: number;
  height: number;
  aspectRatio: number;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
}

export const useResponsive = (): ResponsiveData => {
  // Initial state with defaults
  const [responsive, setResponsive] = useState<ResponsiveData>({
    width: 0,
    height: 0,
    aspectRatio: 0,
    screenSize: 'md',
    isMobile: false,
    isTablet: false, 
    isDesktop: false,
    isPortrait: true,
    isLandscape: false
  });

  useEffect(() => {
    // Function to handle viewport sizing
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;
      const isPortrait = height > width;
      
      // Set CSS variable for viewport height to handle mobile browsers
      document.documentElement.style.setProperty('--vh', `${height * 0.01}px`);
      
      // Determine screen size category
      let screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'xs';
      if (width >= breakpoints.xl) screenSize = 'xl';
      else if (width >= breakpoints.lg) screenSize = 'lg';
      else if (width >= breakpoints.md) screenSize = 'md';
      else if (width >= breakpoints.sm) screenSize = 'sm';
      
      // Determine device type
      const isMobile = width < breakpoints.md;
      const isTablet = width >= breakpoints.md && width < breakpoints.lg;
      const isDesktop = width >= breakpoints.lg;
      
      setResponsive({
        width,
        height,
        aspectRatio,
        screenSize,
        isMobile,
        isTablet,
        isDesktop,
        isPortrait,
        isLandscape: !isPortrait
      });
    };
    
    // Initial call
    updateDimensions();
    
    // Add event listeners
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', updateDimensions);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
    };
  }, []);
  
  return responsive;
};

export default useResponsive;
