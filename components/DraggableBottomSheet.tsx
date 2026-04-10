import React, { useRef, useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Radius, Layout, Shadows, Spacing } from '@/constants/design';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DraggableBottomSheetProps {
  children: React.ReactNode;
  collapsedHeight?: number;
  expandedHeight?: number;
  onStateChange?: (isExpanded: boolean) => void;
  showHandle?: boolean;
  scrollEnabled?: boolean;
  backgroundComponent?: React.ReactNode;
}

export const DraggableBottomSheet: React.FC<DraggableBottomSheetProps> = ({
  children,
  collapsedHeight = 140,
  expandedHeight = SCREEN_HEIGHT * 0.75,
  onStateChange,
  showHandle = true,
  scrollEnabled = true,
  backgroundComponent,
}) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const animatedValue = useRef(new Animated.Value(collapsedHeight)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastGestureDy = useRef(0);

  const SNAP_POINTS = {
    COLLAPSED: collapsedHeight,
    EXPANDED: expandedHeight,
  };

  const animateTo = useCallback((toValue: number) => {
    Animated.spring(animatedValue, {
      toValue,
      useNativeDriver: true,
      friction: 10,
      tension: 80,
    }).start();
    
    const newIsExpanded = toValue === SNAP_POINTS.EXPANDED;
    setIsExpanded(newIsExpanded);
    onStateChange?.(newIsExpanded);
  }, [SNAP_POINTS, onStateChange]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical gestures
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        animatedValue.stopAnimation((value) => {
          lastGestureDy.current = value;
        });
      },
      onPanResponderMove: (_, gestureState) => {
        const newValue = lastGestureDy.current + gestureState.dy;
        // Constrain between collapsed and expanded
        const constrainedValue = Math.max(
          SNAP_POINTS.COLLAPSED,
          Math.min(SNAP_POINTS.EXPANDED, newValue)
        );
        animatedValue.setValue(constrainedValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentValue = lastGestureDy.current + gestureState.dy;
        const velocity = gestureState.vy;
        
        // Determine snap point based on position and velocity
        const threshold = (SNAP_POINTS.COLLAPSED + SNAP_POINTS.EXPANDED) / 2;
        
        if (velocity < -0.5 || (currentValue < threshold && velocity < 0.3)) {
          animateTo(SNAP_POINTS.EXPANDED);
        } else if (velocity > 0.5 || currentValue > threshold) {
          animateTo(SNAP_POINTS.COLLAPSED);
        } else {
          animateTo(isExpanded ? SNAP_POINTS.EXPANDED : SNAP_POINTS.COLLAPSED);
        }
      },
    })
  ).current;

  const toggleExpand = useCallback(() => {
    animateTo(isExpanded ? SNAP_POINTS.COLLAPSED : SNAP_POINTS.EXPANDED);
  }, [isExpanded, animateTo, SNAP_POINTS]);

  // Interpolate for background fade
  const backgroundOpacity = animatedValue.interpolate({
    inputRange: [SNAP_POINTS.COLLAPSED, SNAP_POINTS.EXPANDED],
    outputRange: [0, 0.5],
    extrapolate: 'clamp',
  });

  const sheetTranslateY = animatedValue;

  return (
    <View style={styles.container}>
      {/* Background content (Map) */}
      <View style={StyleSheet.absoluteFill}>
        {backgroundComponent}
      </View>

      {/* Backdrop when expanded */}
      <Animated.View
        style={[
          styles.backdrop,
          { opacity: backgroundOpacity },
        ]}
        pointerEvents={isExpanded ? 'auto' : 'none'}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={() => animateTo(SNAP_POINTS.COLLAPSED)}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: theme.surface,
            transform: [{ translateY: sheetTranslateY }],
            paddingBottom: insets.bottom,
            height: expandedHeight + insets.bottom,
          },
        ]}
      >
        {/* Handle bar */}
        {showHandle && (
          <View style={styles.handleContainer} {...panResponder.panHandlers}>
            <View style={[styles.handle, { backgroundColor: isDark ? '#475569' : '#cbd5e1' }]} />
          </View>
        )}

        {/* Content */}
        <View style={styles.content} {...panResponder.panHandlers}>
          {scrollEnabled ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              scrollEnabled={isExpanded}
              contentContainerStyle={styles.scrollContent}
              bounces={false}
            >
              {children}
            </ScrollView>
          ) : (
            children
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 10,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    ...Shadows['2xl'],
    zIndex: 20,
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing[3],
    zIndex: 30,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
