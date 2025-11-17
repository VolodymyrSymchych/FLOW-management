/**
 * Design Tokens
 *
 * Centralized design system values for consistent styling across the application.
 * These tokens are used in Tailwind config and can be referenced in components.
 */

export const designTokens = {
  /**
   * Color Palette
   */
  colors: {
    // Primary brand colors
    primary: {
      50: '#f0f4ff',
      100: '#e0e9ff',
      200: '#c7d8ff',
      300: '#a5bcff',
      400: '#8098f9',
      500: '#6366f1', // Primary
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
    },

    // Secondary accent colors
    secondary: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef', // Secondary
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75',
    },

    // Semantic colors
    success: {
      DEFAULT: '#22c55e',
      light: '#4ade80',
      dark: '#16a34a',
    },

    danger: {
      DEFAULT: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },

    warning: {
      DEFAULT: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },

    info: {
      DEFAULT: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },

    // Neutral colors (light mode)
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },

    // Glassmorphism backgrounds
    glass: {
      light: 'rgba(255, 255, 255, 0.05)',
      medium: 'rgba(255, 255, 255, 0.1)',
      heavy: 'rgba(255, 255, 255, 0.15)',
      strong: 'rgba(255, 255, 255, 0.2)',
    },
  },

  /**
   * Spacing Scale
   * Base unit: 4px (0.25rem)
   */
  spacing: {
    0: '0px',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
    20: '5rem',    // 80px
    24: '6rem',    // 96px
    32: '8rem',    // 128px
  },

  /**
   * Typography
   */
  typography: {
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      mono: ['Fira Code', 'ui-monospace', 'monospace'],
    },

    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
      sm: ['0.875rem', { lineHeight: '1.25rem' }],   // 14px
      base: ['1rem', { lineHeight: '1.5rem' }],      // 16px
      lg: ['1.125rem', { lineHeight: '1.75rem' }],   // 18px
      xl: ['1.25rem', { lineHeight: '1.75rem' }],    // 20px
      '2xl': ['1.5rem', { lineHeight: '2rem' }],     // 24px
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],  // 36px
      '5xl': ['3rem', { lineHeight: '1' }],          // 48px
    },

    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },

    letterSpacing: {
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  /**
   * Border Radius
   */
  borderRadius: {
    none: '0px',
    sm: '0.25rem',   // 4px
    DEFAULT: '0.5rem', // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    '2xl': '2rem',   // 32px
    full: '9999px',
  },

  /**
   * Shadows
   */
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',

    // Glassmorphism shadows
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  },

  /**
   * Transitions
   */
  transitions: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms',
    },

    timing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      linear: 'linear',
    },
  },

  /**
   * Z-Index Scale
   */
  zIndex: {
    hide: -1,
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
  },

  /**
   * Breakpoints
   */
  breakpoints: {
    sm: '640px',   // Mobile landscape
    md: '768px',   // Tablet
    lg: '1024px',  // Desktop
    xl: '1280px',  // Large desktop
    '2xl': '1536px', // Extra large desktop
  },

  /**
   * Layout
   */
  layout: {
    maxWidth: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      full: '100%',
    },

    container: {
      padding: {
        DEFAULT: '1rem',  // 16px
        sm: '2rem',       // 32px
        lg: '4rem',       // 64px
        xl: '5rem',       // 80px
        '2xl': '6rem',    // 96px
      },
    },
  },

  /**
   * Animation Presets
   */
  animations: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },

    slideUp: {
      from: { transform: 'translateY(10px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },

    slideDown: {
      from: { transform: 'translateY(-10px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },

    scaleIn: {
      from: { transform: 'scale(0.95)', opacity: 0 },
      to: { transform: 'scale(1)', opacity: 1 },
    },

    shimmer: {
      '0%': { backgroundPosition: '-1000px 0' },
      '100%': { backgroundPosition: '1000px 0' },
    },
  },

  /**
   * Component Specific Tokens
   */
  components: {
    button: {
      height: {
        sm: '2rem',    // 32px
        md: '2.5rem',  // 40px
        lg: '3rem',    // 48px
      },
      padding: {
        sm: '0.5rem 1rem',
        md: '0.75rem 1.5rem',
        lg: '1rem 2rem',
      },
    },

    input: {
      height: {
        sm: '2rem',    // 32px
        md: '2.5rem',  // 40px
        lg: '3rem',    // 48px
      },
    },

    modal: {
      maxWidth: {
        sm: '24rem',   // 384px
        md: '32rem',   // 512px
        lg: '42rem',   // 672px
        xl: '48rem',   // 768px
        '2xl': '56rem', // 896px
        full: '100%',
      },
    },

    card: {
      padding: {
        sm: '1rem',    // 16px
        md: '1.5rem',  // 24px
        lg: '2rem',    // 32px
      },
    },
  },
} as const;

/**
 * Type-safe design token access
 */
export type DesignTokens = typeof designTokens;

/**
 * Utility function to get nested token values
 */
export function getToken<T extends keyof DesignTokens>(
  category: T,
  path: string
): any {
  const keys = path.split('.');
  let value: any = designTokens[category];

  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) break;
  }

  return value;
}

/**
 * Example usage:
 *
 * import { designTokens, getToken } from '@/lib/design-tokens';
 *
 * // Direct access
 * const primaryColor = designTokens.colors.primary[500];
 * const spacing = designTokens.spacing[4];
 *
 * // Using getter
 * const shadowLg = getToken('shadows', 'lg');
 * const buttonPadding = getToken('components', 'button.padding.md');
 *
 * // In components
 * <div style={{
 *   backgroundColor: designTokens.colors.glass.medium,
 *   borderRadius: designTokens.borderRadius.lg,
 *   padding: designTokens.spacing[4]
 * }}>
 *   Content
 * </div>
 */
