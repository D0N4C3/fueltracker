import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MapPin, Navigation, Clock3, Award, ArrowUpRight } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { FuelStation } from '@/types';
import { Radius, Spacing, Typography, getFuelColor, getQueueColor } from '@/constants/design';
import { formatTimeAgo, getQueueLevelText } from '@/mocks/stations';
import * as Haptics from 'expo-haptics';
import { MetricRow, PanelCard, StatusPill } from '@/components/ui-system';

interface BestStationCardProps {
  station: FuelStation;
  distance?: number;
  onPress: (station: FuelStation) => void;
  onNavigate?: (station: FuelStation) => void;
}

export const BestStationCard: React.FC<BestStationCardProps> = ({ station, distance, onPress, onNavigate }) => {
  const { theme } = useTheme();
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
        <PanelCard style={{ backgroundColor: theme.surfaceElevated }}>
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
            <StatusPill label="Fuel ready" color={getFuelColor(station.currentStatus.fuelAvailable)} />
            <StatusPill label={getQueueLevelText(station.currentStatus.queueLevel)} color={getQueueColor(station.currentStatus.queueLevel)} />
          </View>

          <View style={styles.footer}>
            <View style={styles.metaGroup}>
              <MetricRow icon={<Navigation size={13} color={theme.text.tertiary} />} label="away" value={formattedDistance} />
              <MetricRow icon={<Clock3 size={13} color={theme.text.tertiary} />} label="updated" value={formatTimeAgo(station.currentStatus.lastUpdated)} />
            </View>
            <TouchableOpacity style={[styles.cta, { backgroundColor: theme.accent }]} onPress={() => onNavigate?.(station)}>
              <ArrowUpRight size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </PanelCard>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: Radius.full, paddingVertical: Spacing[1], paddingHorizontal: Spacing[2.5], flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: Spacing[2] },
  badgeText: { color: '#fff', fontSize: Typography.roles.meta.lg, fontWeight: '700' },
  name: { fontSize: Typography.roles.title.sm, fontWeight: '700', marginTop: 2 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  address: { fontSize: Typography.roles.body.md, flex: 1 },
  pillRow: { flexDirection: 'row', gap: Spacing[2], marginTop: Spacing[2], flexWrap: 'wrap' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing[3] },
  metaGroup: { gap: 6 },
  cta: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
});
