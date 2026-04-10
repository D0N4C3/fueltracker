import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MapPin, Navigation, Zap, Clock, TrendingDown, Award, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { FuelStation } from '@/types';
import { Radius, Shadows, Spacing, Typography, Colors, getFuelColor, getQueueColor } from '@/constants/design';
import { formatTimeAgo } from '@/mocks/stations';
import * as Haptics from 'expo-haptics';

interface BestStationCardProps {
  station: FuelStation;
  distance?: number;
  onPress: (station: FuelStation) => void;
  onNavigate?: (station: FuelStation) => void;
}

export const BestStationCard: React.FC<BestStationCardProps> = ({
  station,
  distance,
  onPress,
  onNavigate,
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

  const handleNavigate = useCallback((e: any) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onNavigate?.(station);
  }, [onNavigate, station]);

  const formattedDistance = useMemo(() => {
    if (distance === undefined) return null;
    if (distance < 1) return `${(distance * 1000).toFixed(0)}m`;
    return `${distance.toFixed(1)}km`;
  }, [distance]);

  const queueColor = getQueueColor(station.currentStatus.queueLevel);
  const fuelColor = getFuelColor(station.currentStatus.fuelAvailable);

  const queueLabel = useMemo(() => {
    switch (station.currentStatus.queueLevel) {
      case 'none': return 'No wait';
      case 'short': return 'Short wait';
      case 'medium': return 'Medium wait';
      case 'long': return 'Long wait';
      default: return 'Unknown';
    }
  }, [station.currentStatus.queueLevel]);

  const gradientColors = isDark 
    ? ['#1e293b', '#0f172a'] as const
    : ['#ffffff', '#f8fafc'] as const;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={1}
        style={styles.container}
      >
        <LinearGradient
          colors={gradientColors}
          style={[
            styles.gradient,
            { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' },
          ]}
        >
          {/* Best Choice Badge */}
          <View style={styles.bestBadgeContainer}>
            <LinearGradient
              colors={[Colors.success.DEFAULT, '#16a34a']}
              style={styles.bestBadge}
            >
              <Award size={14} color="#fff" />
              <Text style={styles.bestBadgeText}>Best Nearby</Text>
            </LinearGradient>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <Text style={[styles.stationName, { color: theme.text.primary }]} numberOfLines={1}>
                {station.name}
              </Text>
              <View style={styles.locationRow}>
                <MapPin size={14} color={theme.text.tertiary} />
                <Text style={[styles.address, { color: theme.text.secondary }]} numberOfLines={1}>
                  {station.address}
                </Text>
              </View>
            </View>
            {formattedDistance && (
              <View style={[styles.distanceBadge, { backgroundColor: theme.accentLight }]}>
                <Navigation size={12} color={theme.accent} />
                <Text style={[styles.distanceText, { color: theme.accent }]}>
                  {formattedDistance}
                </Text>
              </View>
            )}
          </View>

          {/* Status Cards */}
          <View style={styles.statusGrid}>
            {/* Fuel Status */}
            <View style={[styles.statusCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
              <View style={[styles.statusIcon, { backgroundColor: `${fuelColor}20` }]}>
                <Zap size={20} color={fuelColor} />
              </View>
              <View>
                <Text style={[styles.statusLabel, { color: theme.text.tertiary }]}>
                  Fuel Status
                </Text>
                <Text style={[styles.statusValue, { color: fuelColor }]}>
                  {station.currentStatus.fuelAvailable === 'both' ? 'Available' : 
                   station.currentStatus.fuelAvailable === 'none' ? 'Empty' :
                   station.currentStatus.fuelAvailable.charAt(0).toUpperCase() + station.currentStatus.fuelAvailable.slice(1)}
                </Text>
              </View>
            </View>

            {/* Queue Status */}
            <View style={[styles.statusCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
              <View style={[styles.statusIcon, { backgroundColor: `${queueColor}20` }]}>
                <Clock size={20} color={queueColor} />
              </View>
              <View>
                <Text style={[styles.statusLabel, { color: theme.text.tertiary }]}>
                  Queue
                </Text>
                <Text style={[styles.statusValue, { color: queueColor }]}>
                  {queueLabel}
                </Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerInfo}>
              <TrendingDown size={14} color={Colors.success.DEFAULT} />
              <Text style={[styles.footerText, { color: theme.text.tertiary }]}>
                Updated {formatTimeAgo(station.currentStatus.lastUpdated)}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.ctaButton, { backgroundColor: theme.accent }]} 
              onPress={handlePress}
            >
              <Text style={styles.ctaText}>View Details</Text>
              <ArrowRight size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing[4],
    marginBottom: Spacing[4],
    ...Shadows.lg,
  },
  gradient: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
  },
  bestBadgeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[1.5],
    borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: Radius.lg,
    ...Shadows.md,
  },
  bestBadgeText: {
    color: '#fff',
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[8],
    paddingBottom: Spacing[4],
  },
  titleSection: {
    flex: 1,
    marginRight: Spacing[3],
  },
  stationName: {
    fontSize: Typography.sizes.xl,
    fontWeight: '700',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  address: {
    fontSize: Typography.sizes.sm,
    flex: 1,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    borderRadius: Radius.full,
  },
  distanceText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
  },
  statusGrid: {
    flexDirection: 'row',
    gap: Spacing[3],
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[4],
  },
  statusCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    padding: Spacing[3],
    borderRadius: Radius.lg,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: '500',
    marginBottom: 2,
  },
  statusValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[5],
    paddingTop: Spacing[2],
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '500',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2.5],
    borderRadius: Radius.lg,
    ...Shadows.sm,
  },
  ctaText: {
    color: '#fff',
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
  },
});
