import { useState, useEffect } from 'react';

/**
 * Custom responsive window dimensions hook.
 * Breakpoints:
 * - Phone / Mobile: < 640px (sm)
 * - Tablet: 640px - 1023px (md)
 * - Desktop: >= 1024px (lg)
 */
export default function useWindowDimensions() {
  const [dimensions, setDimensions] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 640 : false,
    isTablet:
      typeof window !== 'undefined'
        ? window.innerWidth >= 640 && window.innerWidth < 1024
        : false,
    isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
    deviceType:
      typeof window === 'undefined' || window.innerWidth >= 1024
        ? 'desktop'
        : window.innerWidth >= 640
        ? 'tablet'
        : 'mobile',
  }));

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isMobile = w < 640;
      const isTablet = w >= 640 && w < 1024;
      const isDesktop = w >= 1024;
      const deviceType = isDesktop ? 'desktop' : isTablet ? 'tablet' : 'mobile';

      setDimensions({
        width: w,
        height: h,
        isMobile,
        isTablet,
        isDesktop,
        deviceType,
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    handleResize(); // Initial call

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return dimensions;
}
