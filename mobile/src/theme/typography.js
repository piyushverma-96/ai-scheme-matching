// UdyamNex Typography System
// Legible, high-contrast, scalable sans-serif definitions

import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'sans-serif',
});

export const typography = {
  // Font Sizes
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    base: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    display: 28,
  },

  // Line Heights
  lineHeight: {
    xs: 15,
    sm: 18,
    md: 22,
    base: 22,
    lg: 24,
    xl: 28,
    xxl: 32,
    display: 36,
  },

  // Font Weights
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Standard Text Styles
  styles: {
    display: {
      fontFamily,
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '700',
      color: '#0B2545',
    },
    h1: {
      fontFamily,
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '700',
      color: '#0B2545',
    },
    h2: {
      fontFamily,
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '700',
      color: '#0B2545',
    },
    h3: {
      fontFamily,
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '600',
      color: '#0F172A',
    },
    body: {
      fontFamily,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400',
      color: '#475569',
    },
    bodyBold: {
      fontFamily,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600',
      color: '#0F172A',
    },
    caption: {
      fontFamily,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400',
      color: '#64748B',
    },
    captionBold: {
      fontFamily,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '600',
      color: '#475569',
    },
    button: {
      fontFamily,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600',
      textAlign: 'center',
    },
  },
};
