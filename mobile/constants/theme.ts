// 'Flow Management' Theme - Premium Dark Coffee Aesthetic
export const Colors = {
  // Primary brand color - Purple
  primary: '#A65DFF',
  primaryDark: '#8B4DD9',

  // Secondary brand color
  secondary: '#A65DFF',

  // Background colors - Deep Coffee / Warm Charcoal
  background: {
    primary: '#131110',    // Almost black warm brown
    secondary: '#1C1917',  // Dark espresso
    tertiary: '#262321',   // Lighter espresso
    gradient: ['#1C1917', '#131110', '#0A0908'], // Subtle deep gradient
  },

  // Card Backgrounds (Opaque-ish look)
  card: {
    default: '#1E1C1A',
    highlight: '#252220',
  },

  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#9CA3AF',   // Cool gray for contrast
    tertiary: '#6B7280',    // Darker gray
    muted: '#524C48',       // Warm muted gray
  },

  // Semantic/Status colors (from screenshot dots)
  status: {
    red: '#EF4444',
    orange: '#F97316',
    blue: '#3B82F6',
    yellow: '#EAB308',
    purple: '#A855F7',
  },

  // Semantic helpers
  success: '#22C55E',
  danger: '#EF4444',
  warning: '#F59E0B',

  // Glass colors - transparent for visible blur effect
  glass: {
    heavy: 'rgba(30, 28, 26, 0.25)',   // More transparent for blur
    medium: 'rgba(30, 28, 26, 0.20)',
    light: 'rgba(30, 28, 26, 0.15)',
    subtle: 'rgba(255, 255, 255, 0.05)',
  },

  // Border colors - Subtle separation
  border: {
    heavy: 'rgba(255, 255, 255, 0.12)',
    medium: 'rgba(255, 255, 255, 0.08)',
    light: 'rgba(255, 255, 255, 0.06)',
    subtle: 'rgba(255, 255, 255, 0.04)',
  },

  // Icon background colors
  iconBg: {
    primary: 'rgba(166, 93, 255, 0.15)',
    secondary: 'rgba(166, 93, 255, 0.15)',
    success: 'rgba(82, 198, 137, 0.15)',
    danger: 'rgba(233, 107, 125, 0.15)',
    warning: 'rgba(255, 165, 0, 0.15)',
    neutral: 'rgba(255, 255, 255, 0.05)',
  },
};

// Typography
export const Typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
};

// Border radius
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

// Shadow definitions
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
};
