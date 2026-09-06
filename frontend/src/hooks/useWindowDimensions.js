import { useState, useEffect } from 'react';

/**
 * Standardized responsive window dimensions hook.
 * Unified Breakpoints:
 * - Mobile: < 768px
 * - Tablet: 768px - 1024px
 * - Desktop: > 1024px
 */
export default function useWindowDimensions() {
  const [dimensions, setDimensions] = useState(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const h = typeof window !== 'undefined' ? window.innerHeight : 800;
    const isMobile = w < 768;
    const isTablet = w >= 768 && w <= 1024;
    const isDesktop = w > 1024;
    const deviceType = isDesktop ? 'desktop' : isTablet ? 'tablet' : 'mobile';

    return {
      width: w,
      height: h,
      isMobile,
      isTablet,
      isDesktop,
      deviceType,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isMobile = w < 768;
      const isTablet = w >= 768 && w <= 1024;
      const isDesktop = w > 1024;
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
