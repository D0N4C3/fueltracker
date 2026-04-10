import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MapPin, Clock, Navigation, Zap, Fuel, AlertCircle, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { FuelStation, QueueLevel, FuelType } from '@/types';
import { Radius, Shadows, Spacing, Typography } from '@/constants/design';
import { Colors, getFuelColor, getQueueColor, getQueueProgress } from '@/constants/design';
import { formatTimeAgo } from '@/mocks/stations';
import * as Haptics from 'expo-haptics';

interface StationCardProps {
  station: FuelStation;
  onPress: (station: FuelStation) => void;
  distance?: number;
  isBest?: boolean;
  style?: any;
}

const QueueProgressBar: React.FC<{ level: QueueLevel }> = ({ level }) => {
  const progress = getQueueProgress(level);
  const color = getQueueColor(level);
  
  return (
    <View style={styles.progressContainer}>
      <View style={[styles.progressTrack, { backgroundColor: 'rgba(0,0,0,0.06)' }]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: `${progress * 100}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
};

const FuelBadge: React.FC<{ status: FuelType; size?: 'sm' | 'md' }> = ({ status, size = 'md' }) => {
  const color = getFuelColor(status);
  const isSmall = size === 'sm';
  
  const icon = useMemo(() => {
    const iconSize = isSmall ? 10 : 12;
    switch (status) {
      case 'both':
        return <Zap size={iconSize} color="#fff" />;
      case 'petrol':
      case 'diesel':
        return <Fuel size={iconSize} color="#fff" />;
      case 'none':
        return <AlertCircle size={iconSize} color="#fff" />;
      default:
        return <AlertCircle size={iconSize} color="#fff" />;
    }
  }, [status, isSmall]);

  return (
    <View
      style={[
        styles.fuelBadge,
        {
          backgroundColor: color,
          width: isSmall ? 20 : 24,
          height: isSmall ? 20 : 24,
          borderRadius: isSmall ? 10 : 12,
        },
      ]}
    >
      {icon}
    </View>
  );
};

const QueueBadge: React.FC<{ level: QueueLevel }> = ({ level }) => {
  const color = getQueueColor(level);
  
  const label = useMemo(() => {
    switch (level) {
      case 'none': return 'No Queue';
      case 'short': return 'Short';
      case 'medium': return 'Medium';
      case 'long': return 'Long';
      default: return 'Unknown';
    }
  }, [level]);

  return (
    <View style={[styles.queueBadge, { backgroundColor: `${color}15` }]}>
      <View style={[styles.queueDot, { backgroundColor: color }]} />
      <Text style={[styles.queueBadgeText, { color }]}>{label}</Text>
    </View>
  );
};

export const StationCard: React.FC<StationCardProps> = ({
  station,
  onPress,
  distance,
  isBest = false,
  style,
}) => {
  const { theme, isDark } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      friction: 8,
      tension: 400,
    }).start();
  }, []);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 400,
    }).start();
  }, []);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(station);
  }, [onPress, station]);

  const formattedDistance = useMemo(() => {
    if (distance === undefined) return null;
    if (distance < 1) return `${(distance * 1000).toFixed(0)}m`;
    return `${distance.toFixed(1)}km`;
  }, [distance]);

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={1}
        style={[
          styles.container,
          {
            backgroundColor: theme.surface,
            ...Shadows.sm,
          },
          isBest && styles.bestCard,
          isBest && { borderColor: Colors.success.DEFAULT },
        ]}
      >
        {isBest && (
          <View style={[styles.bestBadge, { backgroundColor: Colors.success.DEFAULT }]}>
            <Zap size={12} color="#fff" />
            <Text style={styles.bestBadgeText}>Best Choice</Text>
          </View>
        )}

        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={[styles.stationName, { color: theme.text.primary }]} numberOfLines={1}>
              {station.name}
            </Text>
            <Text style={[styles.address, { color: theme.text.tertiary }]} numberOfLines={1}>
              {station.address}
            </Text>
          </View>
          <FuelBadge status={station.currentStatus.fuelAvailable} />
        </View>

        <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

        <View style={styles.statsRow}>
          <QueueBadge level={station.currentStatus.queueLevel} />
          
          <View style={styles.statItem}>
            <Clock size={14} color={theme.text.tertiary} />
            <Text style={[styles.statText, { color: theme.text.tertiary }]}>
              {formatTimeAgo(station.currentStatus.lastUpdated)}
            </Text>
          </View>

          {formattedDistance && (
            <View style={styles.statItem}>
              <Navigation size={14} color={theme.text.tertiary} />
              <Text style={[styles.statText, { color: theme.text.tertiary }]}>
                {formattedDistance}
              </Text>
            </View>
          )}
        </View>

        <QueueProgressBar level={station.currentStatus.queueLevel} />

        <View style={styles.footer}>
          <View style={[styles.confidenceBadge, { backgroundColor: theme.surfacePressed }]}>
            <Text style={[styles.confidenceText, { color: theme.text.tertiary }]}>
              {Math.round(station.currentStatus.confidence * 100)}% confidence
            </Text>
          </View>
          <ChevronRight size={18} color={theme.text.tertiary} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.xl,
    padding: Spacing[5],
    marginHorizontal: Spacing[4],
    marginBottom: Spacing[3],
  },
  bestCard: {
    borderWidth: 2,
  },
  bestBadge: {
    position: 'absolute',
    top: -10,
    left: Spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: Radius.full,
    ...Shadows.md,
  },
  bestBadgeText: {
    color: '#fff',
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  titleSection: {
    flex: 1,
  },
  stationName: {
    fontSize: Typography.sizes.lg,
    fontWeight: '600',
    marginBottom: 4,
  },
  address: {
    fontSize: Typography.sizes.sm,
  },
  fuelBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginVertical: Spacing[4],
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
    marginBottom: Spacing[3],
  },
  queueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[1],
    borderRadius: Radius.full,
  },
  queueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  queueBadgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: Spacing[3],
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  confidenceBadge: {
    backgroundColor: 'rgba(0,0,0,0.04)',
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[1],
    borderRadius: Radius.sm,
  },
  confidenceText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '500',
  },
});
