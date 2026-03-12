export type TokenScale = Record<string, string>;

export type ThemeSemanticColors = {
  background: string;
  foreground: string;
  surface: string;
  surfaceElevated: string;
  surfaceMuted: string;
  card: string;
  border: string;
  borderStrong: string;
  primary: string;
  primaryStrong: string;
  secondary: string;
  accent: string;
  accentSoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
};

export const designTokens = {
  colors: {
    light: {
      background: '#F5F5F0',
      foreground: '#1C1C1A',
      surface: '#FFFFFF',
      surfaceElevated: '#FFFFFF',
      surfaceMuted: '#EEEDE8',
      card: '#FFFFFF',
      border: 'rgba(15, 15, 14, 0.07)',
      borderStrong: 'rgba(15, 15, 14, 0.13)',
      primary: '#E8753A',
      primaryStrong: '#C05A22',
      secondary: '#6941C6',
      accent: '#E8753A',
      accentSoft: '#FDF1EB',
      success: '#3D7A5A',
      successSoft: '#EAF2ED',
      warning: '#B8870A',
      warningSoft: '#F7F0DC',
      danger: '#B83232',
      dangerSoft: '#F7E8E8',
      info: '#2E5DA8',
      infoSoft: '#EBF0F9',
      textPrimary: '#1C1C1A',
      textSecondary: '#3A3A36',
      textTertiary: '#6B6B65',
      textInverse: '#FFFFFF',
    } satisfies ThemeSemanticColors,
    dark: {
      background: '#171613',
      foreground: '#F3F1EA',
      surface: '#201F1C',
      surfaceElevated: '#2A2925',
      surfaceMuted: '#24231F',
      card: '#201F1C',
      border: 'rgba(243, 241, 234, 0.08)',
      borderStrong: 'rgba(243, 241, 234, 0.14)',
      primary: '#E78A57',
      primaryStrong: '#F1A06E',
      secondary: '#8D71D4',
      accent: '#E78A57',
      accentSoft: 'rgba(231, 138, 87, 0.16)',
      success: '#6DA785',
      successSoft: 'rgba(109, 167, 133, 0.16)',
      warning: '#D3A637',
      warningSoft: 'rgba(211, 166, 55, 0.16)',
      danger: '#D66A6A',
      dangerSoft: 'rgba(214, 106, 106, 0.16)',
      info: '#6F95D0',
      infoSoft: 'rgba(111, 149, 208, 0.16)',
      textPrimary: '#F3F1EA',
      textSecondary: '#D2CEC3',
      textTertiary: '#A39C90',
      textInverse: '#171613',
    } satisfies ThemeSemanticColors,
  },
  typography: {
    fontFamily: {
      sans: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      display: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      mono: ['var(--font-inter)', 'Inter', 'ui-monospace', 'sans-serif'],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['0.9375rem', { lineHeight: '1.5rem' }],
      lg: ['1.0625rem', { lineHeight: '1.625rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.375rem', { lineHeight: '1.1' }],
      '5xl': ['3.125rem', { lineHeight: '1' }],
    },
    letterSpacing: {
      tight: '-0.03em',
      normal: '0em',
      wide: '0.03em',
      wider: '0.08em',
      widest: '0.14em',
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  spacing: {
    0: '0px',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
  } satisfies TokenScale,
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.625rem',
    xl: '0.75rem',
    '2xl': '0.875rem',
    full: '9999px',
  } satisfies TokenScale,
  shadows: {
    subtle: '0 1px 2px rgba(15, 15, 14, 0.04)',
    card: '0 10px 30px rgba(15, 15, 14, 0.06)',
    floating: '0 18px 48px rgba(15, 15, 14, 0.12)',
    focus: '0 0 0 3px rgba(232, 117, 58, 0.18)',
  } satisfies TokenScale,
  motion: {
    duration: {
      fast: '120ms',
      normal: '180ms',
      slow: '260ms',
    },
    easing: {
      standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      emphasized: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    },
  },
  layout: {
    sidebarWidth: '18rem',
    sidebarCollapsedWidth: '5.5rem',
    topbarHeight: '4.75rem',
    contentMaxWidth: '96rem',
  },
} as const;

export type DesignTokens = typeof designTokens;
export type ThemeMode = keyof typeof designTokens.colors;
