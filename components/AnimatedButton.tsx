import React, { useRef, useCallback } from 'react';
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  GestureResponderEvent,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';
import { Layout, Radius, Shadows, Spacing } from '@/constants/design';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface AnimatedButtonProps {
  onPress: (event: GestureResponderEvent) => void;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  haptic?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  haptic = true,
  icon,
  iconPosition = 'left',
  fullWidth = false,
}) => {
  const { theme, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        friction: 8,
        tension: 400,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 400,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const handlePress = useCallback((event: GestureResponderEvent) => {
    if (disabled || loading) return;
    
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    onPress(event);
  }, [onPress, disabled, loading, haptic]);

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: theme.accent,
            ...Shadows.md,
          },
          text: { color: '#ffffff' },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: isDark ? theme.surfaceElevated : theme.surface,
            borderWidth: 1,
            borderColor: theme.border,
          },
          text: { color: theme.text.primary },
        };
      case 'ghost':
        return {
          container: { backgroundColor: 'transparent' },
          text: { color: theme.text.secondary },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: theme.accent,
          },
          text: { color: theme.accent },
        };
      case 'danger':
        return {
          container: {
            backgroundColor: '#ef4444',
            ...Shadows.md,
          },
          text: { color: '#ffffff' },
        };
      default:
        return { container: {}, text: {} };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: Radius.md },
          text: { fontSize: 13, fontWeight: '500' },
        };
      case 'lg':
        return {
          container: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: Radius.xl },
          text: { fontSize: 16, fontWeight: '600' },
        };
      case 'md':
      default:
        return {
          container: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: Radius.lg },
          text: { fontSize: 15, fontWeight: '600' },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
    opacity: disabled ? 0.5 : opacityAnim,
  };

  return (
    <Animated.View style={[animatedStyle, fullWidth && { width: '100%' }]}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={1}
        style={[
          styles.button,
          variantStyles.container,
          sizeStyles.container,
          fullWidth && styles.fullWidth,
          style,
        ]}
      >
        <View style={styles.content}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          {React.isValidElement(children) ? children : (
            <Animated.Text style={[styles.text, sizeStyles.text, variantStyles.text, textStyle]}>
              {children}
            </Animated.Text>
          )}
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

interface FABProps {
  onPress: () => void;
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'md' | 'lg';
  style?: ViewStyle;
}

export const FloatingActionButton: React.FC<FABProps> = ({
  onPress,
  icon,
  variant = 'primary',
  size = 'lg',
  style,
}) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      friction: 8,
      tension: 400,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 400,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }, [onPress]);

  const dimensions = size === 'lg' ? Layout.fab.size : Layout.header.iconButtonSize;
  const backgroundColor = variant === 'primary' ? theme.accent : theme.surface;
  const iconColor = variant === 'primary' ? '#fff' : theme.text.primary;

  return (
    <Animated.View
      style={[
        styles.fab,
        {
          width: dimensions,
          height: dimensions,
          borderRadius: dimensions / 2,
          backgroundColor,
          transform: [{ scale: scaleAnim }],
          ...Shadows.xl,
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={1}
        style={styles.fabTouchable}
      >
        {React.cloneElement(icon as React.ReactElement, { color: iconColor })}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  fab: {
    overflow: 'hidden',
  },
  fabTouchable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
