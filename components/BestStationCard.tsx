import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MapPin, Navigation, Clock3, Award, ArrowUpRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { FuelStation } from '@/types';
import { Radius, Shadows, Spacing, Typography, getFuelColor, getQueueColor } from '@/constants/design';
import { formatTimeAgo } from '@/mocks/stations';
import * as Haptics from 'expo-haptics';

interface BestStationCardProps {
  station: FuelStation;
  distance?: number;
  onPress: (station: FuelStation) => void;
  onNavigate?: (station: FuelStation) => void;
}

export const BestStationCard: React.FC<BestStationCardProps> = ({ station, distance, onPress, onNavigate }) => {
  const { theme, isDark } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const formattedDistance = useMemo(() => {
    if (distance == null) return '—';
    return distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`;
  }, [distance]);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(station);
  }, [onPress, station]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], marginHorizontal: Spacing[4], marginBottom: Spacing[4] }}>
      <TouchableOpacity
        onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.985, useNativeDriver: true, friction: 8, tension: 240 }).start()}
        onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 8, tension: 240 }).start()}
        onPress={handlePress}
        activeOpacity={1}
      >
        <LinearGradient
          colors={isDark ? ['#1b2b49', '#121b2d'] : ['#eef3ff', '#ffffff']}
          style={[styles.card, { borderColor: theme.border, ...Shadows.lg }]}
        >
          <View style={[styles.badge, { backgroundColor: theme.accent }]}>
            <Award size={13} color="#fff" />
            <Text style={styles.badgeText}>Best Nearby Match</Text>
          </View>

          <Text style={[styles.name, { color: theme.text.primary }]} numberOfLines={1}>{station.name}</Text>
          <View style={styles.addressRow}>
            <MapPin size={14} color={theme.text.tertiary} />
            <Text style={[styles.address, { color: theme.text.secondary }]} numberOfLines={1}>{station.address}</Text>
          </View>

          <View style={styles.pillRow}>
            <View style={[styles.pill, { backgroundColor: `${getFuelColor(station.currentStatus.fuelAvailable)}22` }]}>
              <Text style={[styles.pillText, { color: getFuelColor(station.currentStatus.fuelAvailable) }]}>Fuel ready</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: `${getQueueColor(station.currentStatus.queueLevel)}22` }]}>
              <Text style={[styles.pillText, { color: getQueueColor(station.currentStatus.queueLevel) }]}>Low wait</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.metaGroup}>
              <View style={styles.meta}><Navigation size={13} color={theme.text.tertiary} /><Text style={[styles.metaText, { color: theme.text.tertiary }]}>{formattedDistance}</Text></View>
              <View style={styles.meta}><Clock3 size={13} color={theme.text.tertiary} /><Text style={[styles.metaText, { color: theme.text.tertiary }]}>{formatTimeAgo(station.currentStatus.lastUpdated)}</Text></View>
            </View>
            <TouchableOpacity style={[styles.cta, { backgroundColor: theme.accent }]} onPress={() => onNavigate?.(station)}>
              <ArrowUpRight size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: Radius['2xl'], padding: Spacing[4], gap: Spacing[2] },
  badge: { alignSelf: 'flex-start', borderRadius: Radius.full, paddingVertical: Spacing[1], paddingHorizontal: Spacing[2.5], flexDirection: 'row', alignItems: 'center', gap: 5 },
  badgeText: { color: '#fff', fontSize: Typography.sizes.xs, fontWeight: '700' },
  name: { fontSize: Typography.sizes['2xl'], fontWeight: '700', marginTop: 2 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  address: { fontSize: Typography.sizes.base, flex: 1 },
  pillRow: { flexDirection: 'row', gap: Spacing[2], marginTop: Spacing[1] },
  pill: { borderRadius: Radius.full, paddingHorizontal: Spacing[3], paddingVertical: Spacing[1.5] },
  pillText: { fontSize: Typography.sizes.xs, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing[2] },
  metaGroup: { gap: 6 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: Typography.sizes.xs, fontWeight: '600' },
  cta: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
});
