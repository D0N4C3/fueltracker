import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Radius } from '@/constants/design';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  shimmer?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = Radius.md,
  style,
  shimmer = true,
}) => {
  const { theme, isDark } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!shimmer) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [shimmerAnim, shimmer]);

  const backgroundColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const shimmerColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {shimmer && (
        <Animated.View
          style={[
            styles.shimmer,
            {
              backgroundColor: shimmerColor,
              transform: [{ translateX }],
            },
          ]}
        />
      )}
    </View>
  );
};

export const SkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View style={[styles.card, style]}>
      <Skeleton width={120} height={20} borderRadius={Radius.sm} />
      <Skeleton width="80%" height={16} style={{ marginTop: 12 }} />
      <Skeleton width="60%" height={14} style={{ marginTop: 8 }} />
      <View style={styles.row}>
        <Skeleton width={60} height={24} borderRadius={Radius.full} />
        <Skeleton width={80} height={14} />
      </View>
    </View>
  );
};

export const SkeletonBestStation: React.FC = () => {
  return (
    <View style={styles.bestStation}>
      <View style={styles.bestStationHeader}>
        <Skeleton width={100} height={16} borderRadius={Radius.sm} />
        <Skeleton width={80} height={14} borderRadius={Radius.sm} />
      </View>
      <Skeleton width="70%" height={28} style={{ marginTop: 12 }} />
      <View style={styles.statsRow}>
        <Skeleton width={80} height={36} borderRadius={Radius.lg} />
        <Skeleton width={100} height={36} borderRadius={Radius.lg} />
      </View>
    </View>
  );
};

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} style={{ marginBottom: 12 }} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  shimmer: {
    width: 100,
    height: '200%',
    transform: [{ skewX: '-20deg' }],
  },
  card: {
    padding: 16,
    borderRadius: Radius.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  bestStation: {
    padding: 20,
    borderRadius: Radius.xl,
  },
  bestStationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  list: {
    paddingHorizontal: 16,
  },
});
