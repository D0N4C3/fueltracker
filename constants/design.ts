import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const Colors = {
  primary: {
    50: '#f6f8ff',
    100: '#e9efff',
    200: '#d4e0ff',
    300: '#b2c8ff',
    400: '#8aa8ff',
    500: '#5e84ff',
    600: '#4867f4',
    700: '#3851d6',
    800: '#2f44ac',
    900: '#293b88',
  },
  success: {
    light: '#dff8ec',
    DEFAULT: '#21b26f',
    dark: '#168852',
    glow: 'rgba(33,178,111,0.35)',
  },
  warning: {
    light: '#fff2d8',
    DEFAULT: '#f4ab3d',
    dark: '#c98722',
    glow: 'rgba(244,171,61,0.35)',
  },
  error: {
    light: '#ffe0df',
    DEFAULT: '#ee5f67',
    dark: '#cc3b44',
    glow: 'rgba(238,95,103,0.35)',
  },
  info: {
    light: '#deefff',
    DEFAULT: '#2f9cff',
    dark: '#1d74d9',
    glow: 'rgba(47,156,255,0.35)',
  },
  fuel: {
    available: '#21b26f',
    petrol: '#2f9cff',
    diesel: '#6d79ff',
    both: '#8b5cf6',
    none: '#7f8aa6',
    unknown: '#f4ab3d',
  },
  queue: {
    none: '#21b26f',
    short: '#80bd37',
    medium: '#f4ab3d',
    long: '#ee5f67',
    unknown: '#95a0bb',
  },
  gray: {
    50: '#f7f8fc',
    100: '#edf0f7',
    200: '#dce2ee',
    300: '#c3ccde',
    400: '#939eb7',
    500: '#69758f',
    600: '#4f5971',
    700: '#3b4458',
    800: '#242c3d',
    900: '#151b2a',
    950: '#0a0f1b',
  },
};

export const LightTheme = {
  background: '#f4f6fb',
  surface: '#ffffff',
  surfaceElevated: '#fdfdff',
  surfacePressed: '#eef1f8',
  text: {
    primary: '#111827',
    secondary: '#4b5565',
    tertiary: '#7d879b',
    inverse: '#ffffff',
  },
  border: '#dde3ef',
  borderSubtle: '#edf1f7',
  divider: '#e8edf5',
  shadow: {
    sm: 'rgba(15, 23, 42, 0.06)',
    md: 'rgba(15, 23, 42, 0.10)',
    lg: 'rgba(15, 23, 42, 0.14)',
    xl: 'rgba(15, 23, 42, 0.20)',
  },
  accent: '#4867f4',
  accentLight: '#e6ebff',
};

export const DarkTheme = {
  background: '#070d19',
  surface: '#111a2c',
  surfaceElevated: '#17243b',
  surfacePressed: '#1f304d',
  text: {
    primary: '#f7f9ff',
    secondary: '#c2cee4',
    tertiary: '#8f9bb8',
    inverse: '#0f172a',
  },
  border: '#2a3a5b',
  borderSubtle: '#1b2841',
  divider: '#2a3a5b',
  shadow: {
    sm: 'rgba(1, 4, 9, 0.35)',
    md: 'rgba(1, 4, 9, 0.45)',
    lg: 'rgba(1, 4, 9, 0.55)',
    xl: 'rgba(1, 4, 9, 0.68)',
  },
  accent: '#8aa8ff',
  accentLight: '#1e2d52',
};

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

export const Spacing = { px: 1, 0.5: 2, 1: 4, 1.5: 6, 2: 8, 2.5: 10, 3: 12, 3.5: 14, 4: 16, 5: 20, 6: 24, 7: 28, 8: 32, 9: 36, 10: 40, 11: 44, 12: 48, 16: 64, 20: 80, 24: 96 };

export const Radius = { none: 0, sm: 6, DEFAULT: 10, md: 14, lg: 18, xl: 24, '2xl': 30, '3xl': 38, full: 9999 };

export const Shadows = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 6 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.14, shadowRadius: 28, elevation: 10 },
  xl: { shadowColor: '#000', shadowOffset: { width: 0, height: 24 }, shadowOpacity: 0.18, shadowRadius: 40, elevation: 14 },
  '2xl': { shadowColor: '#000', shadowOffset: { width: 0, height: 34 }, shadowOpacity: 0.22, shadowRadius: 52, elevation: 18 },
  glow: (color: string) => ({ shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 14, elevation: 8 }),
  inner: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 1 },
};

export const Animations = {
  duration: { instant: 50, fast: 150, normal: 250, slow: 400, slower: 600 },
  easing: { default: 'ease-out', easeIn: 'ease-in', easeInOut: 'ease-in-out', spring: 'spring', bounce: 'bounce' },
  spring: { gentle: { damping: 20, stiffness: 180, mass: 1 }, bouncy: { damping: 12, stiffness: 300, mass: 0.8 }, snappy: { damping: 25, stiffness: 400, mass: 0.5 }, smooth: { damping: 30, stiffness: 150, mass: 1.2 } },
};

export const Layout = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  bottomSheet: { collapsed: 140, half: SCREEN_HEIGHT * 0.5, expanded: SCREEN_HEIGHT * 0.85 },
  card: { borderRadius: Radius.xl, padding: Spacing[5] },
  header: { height: 56, blurIntensity: Platform.OS === 'ios' ? 80 : 100 },
  fab: { size: 56, bottomOffset: 24, rightOffset: 20 },
};

export const ZIndex = { base: 0, dropdown: 10, sticky: 20, modalBackdrop: 30, modal: 40, toast: 50, tooltip: 60 };

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
