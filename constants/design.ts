// PREMIUM DESIGN SYSTEM - FuelFinder Ethiopia
// Fintech-inspired modern design with depth, shadows, and smooth interactions

import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================
// COLORS - Premium fintech palette
// ============================================
export const Colors = {
  // Primary Brand Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Semantic Colors
  success: {
    light: '#dcfce7',
    DEFAULT: '#22c55e',
    dark: '#16a34a',
    glow: 'rgba(34, 197, 94, 0.4)',
  },
  warning: {
    light: '#fef3c7',
    DEFAULT: '#f59e0b',
    dark: '#d97706',
    glow: 'rgba(245, 158, 11, 0.4)',
  },
  error: {
    light: '#fee2e2',
    DEFAULT: '#ef4444',
    dark: '#dc2626',
    glow: 'rgba(239, 68, 68, 0.4)',
  },
  info: {
    light: '#e0f2fe',
    DEFAULT: '#0ea5e9',
    dark: '#0284c7',
    glow: 'rgba(14, 165, 233, 0.4)',
  },
  
  // Fuel Status Colors
  fuel: {
    available: '#10b981',    // Emerald green
    petrol: '#22c55e',       // Green
    diesel: '#3b82f6',       // Blue
    both: '#8b5cf6',         // Violet
    none: '#64748b',         // Slate
    unknown: '#f59e0b',      // Amber
  },
  
  // Queue Level Colors
  queue: {
    none: '#10b981',
    short: '#84cc16',
    medium: '#f59e0b',
    long: '#ef4444',
    unknown: '#94a3b8',
  },
  
  // Neutral Scale
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
};

// ============================================
// LIGHT THEME
// ============================================
export const LightTheme = {
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceElevated: '#ffffff',
  surfacePressed: '#f1f5f9',
  
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    tertiary: '#94a3b8',
    inverse: '#ffffff',
  },
  
  border: '#e2e8f0',
  borderSubtle: '#f1f5f9',
  divider: '#e2e8f0',
  
  shadow: {
    sm: 'rgba(0, 0, 0, 0.04)',
    md: 'rgba(0, 0, 0, 0.06)',
    lg: 'rgba(0, 0, 0, 0.08)',
    xl: 'rgba(0, 0, 0, 0.12)',
  },
  
  accent: Colors.primary[600],
  accentLight: Colors.primary[100],
};

// ============================================
// DARK THEME
// ============================================
export const DarkTheme = {
  background: '#0f172a',
  surface: '#1e293b',
  surfaceElevated: '#334155',
  surfacePressed: '#475569',
  
  text: {
    primary: '#f8fafc',
    secondary: '#cbd5e1',
    tertiary: '#64748b',
    inverse: '#0f172a',
  },
  
  border: '#334155',
  borderSubtle: '#1e293b',
  divider: '#334155',
  
  shadow: {
    sm: 'rgba(0, 0, 0, 0.3)',
    md: 'rgba(0, 0, 0, 0.4)',
    lg: 'rgba(0, 0, 0, 0.5)',
    xl: 'rgba(0, 0, 0, 0.6)',
  },
  
  accent: Colors.primary[400],
  accentLight: Colors.primary[900],
};

// ============================================
// TYPOGRAPHY
// ============================================
export const Typography = {
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
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
  
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// ============================================
// SPACING
// ============================================
export const Spacing = {
  px: 1,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
};

// ============================================
// BORDER RADIUS
// ============================================
export const Radius = {
  none: 0,
  sm: 6,
  DEFAULT: 10,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

// ============================================
// SHADOWS - Premium layered shadows
// ============================================
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 20,
  },
  
  // Colored glow shadows
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  }),
  
  // Inner shadow effect (for pressed states)
  inner: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
};

// ============================================
// ANIMATIONS
// ============================================
export const Animations = {
  // Durations (ms)
  duration: {
    instant: 50,
    fast: 150,
    normal: 250,
    slow: 400,
    slower: 600,
  },
  
  // Easing functions
  easing: {
    default: 'ease-out',
    easeIn: 'ease-in',
    easeInOut: 'ease-in-out',
    spring: 'spring',
    bounce: 'bounce',
  },
  
  // Spring configs for react-native-reanimated
  spring: {
    gentle: { damping: 20, stiffness: 180, mass: 1 },
    bouncy: { damping: 12, stiffness: 300, mass: 0.8 },
    snappy: { damping: 25, stiffness: 400, mass: 0.5 },
    smooth: { damping: 30, stiffness: 150, mass: 1.2 },
  },
};

// ============================================
// LAYOUT CONSTANTS
// ============================================
export const Layout = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  
  // Bottom sheet heights
  bottomSheet: {
    collapsed: 140,
    half: SCREEN_HEIGHT * 0.5,
    expanded: SCREEN_HEIGHT * 0.85,
  },
  
  // Card dimensions
  card: {
    borderRadius: Radius.xl,
    padding: Spacing[5],
  },
  
  // Header
  header: {
    height: 56,
    blurIntensity: Platform.OS === 'ios' ? 80 : 100,
  },
  
  // FAB
  fab: {
    size: 56,
    bottomOffset: 24,
    rightOffset: 20,
  },
};

// ============================================
// Z-INDEX SCALE
// ============================================
export const ZIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  modalBackdrop: 30,
  modal: 40,
  toast: 50,
  tooltip: 60,
};

// ============================================
// HELPER FUNCTIONS
// ============================================
export const getFuelColor = (status: string): string => {
  switch (status) {
    case 'both': return Colors.fuel.both;
    case 'petrol': return Colors.fuel.petrol;
    case 'diesel': return Colors.fuel.diesel;
    case 'none': return Colors.fuel.none;
    default: return Colors.fuel.unknown;
  }
};

export const getQueueColor = (level: string): string => {
  switch (level) {
    case 'none': return Colors.queue.none;
    case 'short': return Colors.queue.short;
    case 'medium': return Colors.queue.medium;
    case 'long': return Colors.queue.long;
    default: return Colors.queue.unknown;
  }
};

export const getQueueProgress = (level: string): number => {
  switch (level) {
    case 'none': return 0;
    case 'short': return 0.25;
    case 'medium': return 0.6;
    case 'long': return 0.95;
    default: return 0.5;
  }
};

// Export all as default
export default {
  Colors,
  LightTheme,
  DarkTheme,
  Typography,
  Spacing,
  Radius,
  Shadows,
  Animations,
  Layout,
  ZIndex,
  getFuelColor,
  getQueueColor,
  getQueueProgress,
};
