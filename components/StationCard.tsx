import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Clock, Navigation, Zap, Fuel, AlertCircle, ChevronRight, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { FuelStation, QueueLevel, FuelType } from '@/types';
import { Radius, Shadows, Spacing, Typography, getFuelColor, getQueueColor, getQueueProgress } from '@/constants/design';
import { formatTimeAgo } from '@/mocks/stations';
import * as Haptics from 'expo-haptics';

interface StationCardProps {
  station: FuelStation;
  onPress: (station: FuelStation) => void;
  distance?: number;
  isBest?: boolean;
  style?: any;
}

const FuelBadge: React.FC<{ status: FuelType }> = ({ status }) => {
  const color = getFuelColor(status);
  const icon = useMemo(() => {
    switch (status) {
      case 'both': return <Zap size={12} color="#fff" />;
      case 'petrol':
      case 'diesel': return <Fuel size={12} color="#fff" />;
      default: return <AlertCircle size={12} color="#fff" />;
    }
  }, [status]);

  return <View style={[styles.fuelBadge, { backgroundColor: color }]}>{icon}</View>;
};

const QueueBadge: React.FC<{ level: QueueLevel }> = ({ level }) => {
  const color = getQueueColor(level);
  const label = { none: 'No queue', short: 'Short', medium: 'Medium', long: 'Long', unknown: 'Unknown' }[level];
  return (
    <View style={[styles.queueBadge, { backgroundColor: `${color}1F` }]}>
      <View style={[styles.queueDot, { backgroundColor: color }]} />
      <Text style={[styles.queueText, { color }]}>{label}</Text>
    </View>
  );
};

export const StationCard: React.FC<StationCardProps> = ({ station, onPress, distance, isBest = false, style }) => {
  const { theme } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(station);
  }, [onPress, station]);

  const formattedDistance = useMemo(() => {
    if (distance == null) return null;
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  }, [distance]);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, friction: 8, tension: 300 }).start()}
        onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 8, tension: 300 }).start()}
        onPress={handlePress}
        activeOpacity={1}
        style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border, ...Shadows.md }]}
      >
        {isBest && <View style={[styles.ribbon, { backgroundColor: theme.accent }]}><Sparkles size={12} color="#fff" /><Text style={styles.ribbonText}>Top Pick</Text></View>}

        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={[styles.name, { color: theme.text.primary }]}>{station.name}</Text>
            <Text numberOfLines={1} style={[styles.address, { color: theme.text.tertiary }]}>{station.address}</Text>
          </View>
          <FuelBadge status={station.currentStatus.fuelAvailable} />
        </View>

        <View style={styles.metaRow}>
          <QueueBadge level={station.currentStatus.queueLevel} />
          <View style={styles.metaItem}><Clock size={13} color={theme.text.tertiary} /><Text style={[styles.metaText, { color: theme.text.tertiary }]}>{formatTimeAgo(station.currentStatus.lastUpdated)}</Text></View>
          {formattedDistance ? <View style={styles.metaItem}><Navigation size={13} color={theme.text.tertiary} /><Text style={[styles.metaText, { color: theme.text.tertiary }]}>{formattedDistance}</Text></View> : null}
        </View>

        <View style={[styles.track, { backgroundColor: theme.surfacePressed }]}>
          <View style={[styles.fill, { width: `${getQueueProgress(station.currentStatus.queueLevel) * 100}%`, backgroundColor: getQueueColor(station.currentStatus.queueLevel) }]} />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.confidence, { color: theme.text.secondary }]}>{Math.round(station.currentStatus.confidence * 100)}% confidence</Text>
          <ChevronRight size={18} color={theme.text.tertiary} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { borderWidth: 1, borderRadius: Radius.xl, padding: Spacing[4], marginHorizontal: Spacing[4], marginBottom: Spacing[3] },
  ribbon: { alignSelf: 'flex-start', borderRadius: Radius.full, paddingHorizontal: Spacing[2.5], paddingVertical: Spacing[1], flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing[3] },
  ribbonText: { color: '#fff', fontSize: Typography.sizes.xs, fontWeight: '700' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  name: { fontSize: Typography.sizes.lg, fontWeight: '700' },
  address: { fontSize: Typography.sizes.sm, marginTop: 2 },
  fuelBadge: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Spacing[2], marginTop: Spacing[3] },
  queueBadge: { borderRadius: Radius.full, paddingHorizontal: Spacing[2.5], paddingVertical: Spacing[1], flexDirection: 'row', alignItems: 'center', gap: 6 },
  queueDot: { width: 7, height: 7, borderRadius: 3.5 },
  queueText: { fontSize: Typography.sizes.xs, fontWeight: '700' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: Typography.sizes.xs, fontWeight: '500' },
  track: { marginTop: Spacing[3], height: 6, borderRadius: Radius.full, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: Radius.full },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing[3] },
  confidence: { fontSize: Typography.sizes.sm, fontWeight: '600' },
});
