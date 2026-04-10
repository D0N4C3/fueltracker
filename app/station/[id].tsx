import React, { useState, useCallback, useMemo, useRef } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Animated, Share } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { 
  ChevronLeft, MapPin, Clock, Phone, Zap, Fuel, AlertCircle, 
  CheckCircle, TrendingUp, TrendingDown, Minus, Share2, 
  Navigation, Timer, Star, Info, CheckCircle2, Clock4
} from "lucide-react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useFuel } from "@/context/FuelContext";
import { useTheme } from "@/context/ThemeContext";
import { FuelStation, QueueLevel, FuelType } from "@/types";
import { 
  Colors, Radius, Shadows, Spacing, Typography, 
  getFuelColor, getQueueColor, getQueueProgress 
} from "@/constants/design";
import { getQueueLevelText, getFuelStatusText, formatTimeAgo } from "@/mocks/stations";
import { AnimatedButton } from "@/components/AnimatedButton";
import { IconButton, MetricRow, PanelCard, ScreenHeader, StatusPill } from "@/components/ui-system";
import * as Haptics from "expo-haptics";

// Visual Queue Indicator
const QueueVisualizer: React.FC<{ level: QueueLevel }> = ({ level }) => {
  const progress = getQueueProgress(level);
  const color = getQueueColor(level);
  const { theme } = useTheme();
  
  return (
    <View style={styles.queueVisualizer}>
      <View style={styles.queueSegments}>
        {[0.25, 0.5, 0.75, 1].map((threshold, index) => (
          <View
            key={index}
            style={[
              styles.queueSegment,
              {
                backgroundColor: progress >= threshold ? color : `${color}30`,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.queueLabels}>
        <Text style={[styles.queueLabel, { color: theme.text.tertiary }]}>Empty</Text>
        <Text style={[styles.queueLabel, { color: theme.text.tertiary }]}>Full</Text>
      </View>
    </View>
  );
};

// Status Badge
const StatusBadge: React.FC<{ status: FuelType }> = ({ status }) => {
  const color = getFuelColor(status);
  const { theme } = useTheme();
  
  const icon = useMemo(() => {
    switch (status) {
      case 'both': return <Zap size={16} color="#fff" />;
      case 'petrol':
      case 'diesel':
        return <Fuel size={16} color="#fff" />;
      case 'none':
        return <AlertCircle size={16} color="#fff" />;
      default:
        return <AlertCircle size={16} color="#fff" />;
    }
  }, [status]);

  return (
    <View style={[styles.statusBadge, { backgroundColor: color }]}>
      {icon}
      <Text style={styles.statusBadgeText}>{getFuelStatusText(status)}</Text>
    </View>
  );
};

// Queue Button
const QueueOption: React.FC<{
  level: QueueLevel;
  selected: boolean;
  onPress: () => void;
}> = ({ level, selected, onPress }) => {
  const { theme } = useTheme();
  const color = getQueueColor(level);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 8,
      tension: 400,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 400,
    }).start();
  };

  const config = {
    none: { icon: CheckCircle2, label: 'No Queue', time: '< 5 min' },
    short: { icon: Timer, label: 'Short', time: '10-20 min' },
    medium: { icon: Clock4, label: 'Medium', time: '30-60 min' },
    long: { icon: Clock, label: 'Long', time: '60+ min' },
  }[level];

  const Icon = config.icon;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={1}
        style={[
          styles.queueOption,
          {
            backgroundColor: selected ? `${color}20` : theme.surfacePressed,
            borderColor: selected ? color : 'transparent',
          },
        ]}
      >
        <Icon size={20} color={color} />
        <Text style={[styles.queueOptionLabel, { color: theme.text.primary }]}>
          {config.label}
        </Text>
        <View style={[styles.timeBadge, { backgroundColor: `${color}15` }]}>
          <Text style={[styles.timeBadgeText, { color }]}>{config.time}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Fuel Option
const FuelOption: React.FC<{
  status: FuelType;
  selected: boolean;
  onPress: () => void;
}> = ({ status, selected, onPress }) => {
  const { theme } = useTheme();
  const color = getFuelColor(status);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 8,
      tension: 400,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 400,
    }).start();
  };

  const icon = useMemo(() => {
    const size = 20;
    switch (status) {
      case 'both': return <Zap size={size} color={color} />;
      case 'petrol':
      case 'diesel':
        return <Fuel size={size} color={color} />;
      case 'none':
        return <AlertCircle size={size} color={color} />;
      default:
        return <AlertCircle size={size} color={color} />;
    }
  }, [status, color]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={1}
        style={[
          styles.fuelOption,
          {
            backgroundColor: selected ? `${color}20` : theme.surfacePressed,
            borderColor: selected ? color : 'transparent',
          },
        ]}
      >
        {icon}
        <Text style={[styles.fuelOptionLabel, { color: theme.text.primary }]}>
          {getFuelStatusText(status)}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function PremiumStationDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { getStation, addReport } = useFuel();
  
  const station = useMemo(() => getStation(id), [id, getStation]);
  
  const [selectedQueue, setSelectedQueue] = useState<QueueLevel | null>(null);
  const [selectedFuel, setSelectedFuel] = useState<FuelType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  // Header opacity based on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleSubmit = useCallback(() => {
    if (!station || !selectedQueue || !selectedFuel) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitting(true);
    
    setTimeout(() => {
      addReport(station.id, {
        stationId: station.id,
        fuelStatus: selectedFuel,
        queueLevel: selectedQueue,
        confidence: 0.95,
        isPassive: false,
      });
      
      setSubmitting(false);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedQueue(null);
        setSelectedFuel(null);
      }, 2000);
    }, 800);
  }, [station, selectedQueue, selectedFuel, addReport]);

  const handleShare = useCallback(async () => {
    if (!station) return;
    try {
      await Share.share({
        message: `Check out ${station.name} on FuelFinder Ethiopia. Current status: ${getFuelStatusText(station.currentStatus.fuelAvailable)}, Queue: ${getQueueLevelText(station.currentStatus.queueLevel)}`,
      });
    } catch (error) {
      console.log(error);
    }
  }, [station]);

  const trendIcon = useMemo(() => {
    if (!station) {
      return <Minus size={18} color={theme.text.tertiary} />;
    }

    switch (station.currentStatus.trend) {
      case 'increasing': return <TrendingUp size={18} color={Colors.error.DEFAULT} />;
      case 'decreasing': return <TrendingDown size={18} color={Colors.success.DEFAULT} />;
      default: return <Minus size={18} color={theme.text.tertiary} />;
    }
  }, [station, theme.text.tertiary]);

  if (!station) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <AlertCircle size={48} color={theme.text.tertiary} />
        <Text style={[styles.errorText, { color: theme.text.secondary }]}>Station not found</Text>
        <AnimatedButton onPress={() => router.back()} variant="secondary">
          Go Back
        </AnimatedButton>
      </View>
    );
  }

  const gradientColors = isDark 
    ? [Colors.primary[900], Colors.primary[800]] as const
    : [Colors.primary[600], Colors.primary[500]] as const;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Animated Header */}
      <Animated.View style={[styles.animatedHeader, { opacity: headerOpacity, paddingTop: insets.top }]}>
        <BlurView intensity={isDark ? 30 : 80} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <View style={styles.animatedHeaderContent}>
          <ScreenHeader
            title={station.name}
            centerTitle
            leftAction={<IconButton onPress={() => router.back()} icon={<ChevronLeft size={22} color={theme.text.primary} />} />}
            rightActions={<IconButton onPress={handleShare} icon={<Share2 size={18} color={theme.text.primary} />} />}
          />
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing[8] }}
        onScroll={(event) => {
          scrollY.setValue(event.nativeEvent.contentOffset.y);
        }}
        scrollEventThrottle={16}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={gradientColors}
          style={[styles.hero, { paddingTop: insets.top + Spacing[6] }]}
        >
          {/* Header Buttons */}
          <View style={styles.heroHeader}>
            <IconButton onPress={() => router.back()} inverted icon={<ChevronLeft size={22} color="#fff" />} />
            <IconButton onPress={handleShare} inverted icon={<Share2 size={18} color="#fff" />} />
          </View>

          {/* Station Info */}
          <View style={styles.heroContent}>
            <View style={styles.brandTag}>
              <Text style={styles.brandText}>{station.brand}</Text>
            </View>
            
            <Text style={styles.stationName}>{station.name}</Text>
            
            <View style={styles.locationRow}>
              <MapPin size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.address} numberOfLines={2}>{station.address}</Text>
            </View>

            {/* Status Cards */}
            <View style={styles.statusCards}>
              <View style={styles.statusCard}>
                <StatusBadge status={station.currentStatus.fuelAvailable} />
              </View>
              <View style={styles.statusCard}>
                <View style={styles.queueInfo}>
                  <View style={[styles.queueDot, { backgroundColor: getQueueColor(station.currentStatus.queueLevel) }]} />
                  <Text style={styles.queueText}>
                    {getQueueLevelText(station.currentStatus.queueLevel)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>
          {/* Quick Stats */}
          <View style={[styles.statsCard, { backgroundColor: theme.surface, ...Shadows.sm }]}>
            <View style={styles.statItem}>
              {trendIcon}
              <View>
                <Text style={[styles.statLabel, { color: theme.text.tertiary }]}>Trend</Text>
                <Text style={[styles.statValue, { color: theme.text.primary }]}>
                  {station.currentStatus.trend === 'increasing' ? 'Growing' : 
                   station.currentStatus.trend === 'decreasing' ? 'Shrinking' : 'Stable'}
                </Text>
              </View>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Clock size={18} color={theme.text.tertiary} />
              <View>
                <Text style={[styles.statLabel, { color: theme.text.tertiary }]}>Updated</Text>
                <Text style={[styles.statValue, { color: theme.text.primary }]}>
                  {formatTimeAgo(station.currentStatus.lastUpdated)}
                </Text>
              </View>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <CheckCircle size={18} color={theme.text.tertiary} />
              <View>
                <Text style={[styles.statLabel, { color: theme.text.tertiary }]}>Confidence</Text>
                <Text style={[styles.statValue, { color: theme.text.primary }]}>
                  {Math.round(station.currentStatus.confidence * 100)}%
                </Text>
              </View>
            </View>
          </View>

          {/* Queue Visualization */}
          <PanelCard style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Current Queue</Text>
            <QueueVisualizer level={station.currentStatus.queueLevel} />
          </PanelCard>

          {/* Quick Report */}
          <PanelCard style={styles.section}>
            <View style={styles.quickBlock}>
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Quick Report</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.text.secondary }]}>
                Help others by updating the status
              </Text>
            </View>

            {showSuccess ? (
              <View style={styles.successBox}>
                <View style={styles.successIcon}>
                  <CheckCircle size={32} color="#fff" />
                </View>
                <Text style={[styles.successTitle, { color: theme.text.primary }]}>
                  Report Submitted!
                </Text>
                <Text style={[styles.successText, { color: theme.text.secondary }]}>
                  Thank you for helping the community
                </Text>
              </View>
            ) : (
              <View style={styles.quickReportStack}>
                <View style={styles.quickBlock}>
                  <StatusPill label="Queue status" color={getQueueColor(selectedQueue || station.currentStatus.queueLevel)} />
                  <View style={styles.optionsGrid}>
                    {(['none', 'short', 'medium', 'long'] as QueueLevel[]).map(level => (
                      <QueueOption
                        key={level}
                        level={level}
                        selected={selectedQueue === level}
                        onPress={() => setSelectedQueue(level)}
                      />
                    ))}
                  </View>
                </View>

                <View style={styles.quickBlock}>
                  <StatusPill label="Fuel availability" color={getFuelColor(selectedFuel || station.currentStatus.fuelAvailable)} />
                  <View style={styles.optionsGrid}>
                    {(['both', 'petrol', 'diesel', 'none'] as FuelType[]).map(status => (
                      <FuelOption
                        key={status}
                        status={status}
                        selected={selectedFuel === status}
                        onPress={() => setSelectedFuel(status)}
                      />
                    ))}
                  </View>
                </View>

                <View style={styles.quickBlock}>
                  <MetricRow
                    icon={<CheckCircle size={14} color={theme.text.tertiary} />}
                    label="confidence"
                    value={`${Math.round(station.currentStatus.confidence * 100)}%`}
                  />
                  <AnimatedButton
                    onPress={handleSubmit}
                    disabled={!selectedQueue || !selectedFuel || submitting}
                    loading={submitting}
                    style={{ marginTop: Spacing[3] }}
                    fullWidth
                  >
                    {submitting ? 'Submitting...' : 'Submit Report'}
                  </AnimatedButton>
                </View>
              </View>
            )}
          </PanelCard>

          {/* Insights */}
          <PanelCard style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Insights</Text>
            
            <View style={styles.insightsGrid}>
              <View style={[styles.insightCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                <View style={[styles.insightIcon, { backgroundColor: theme.surfacePressed }]}>
                  <Star size={20} color={theme.accent} />
                </View>
                <View>
                  <Text style={[styles.insightValue, { color: theme.text.primary }]}>
                    {station.insights.bestTimeToVisit}
                  </Text>
                  <Text style={[styles.insightLabel, { color: theme.text.tertiary }]}>Best Time</Text>
                </View>
              </View>
              
              <View style={[styles.insightCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                <View style={[styles.insightIcon, { backgroundColor: theme.surfacePressed }]}>
                  <Timer size={20} color={theme.accent} />
                </View>
                <View>
                  <Text style={[styles.insightValue, { color: theme.text.primary }]}>
                    {station.insights.averageWaitTime} min
                  </Text>
                  <Text style={[styles.insightLabel, { color: theme.text.tertiary }]}>Avg Wait</Text>
                </View>
              </View>
            </View>
          </PanelCard>

          {/* Station Details */}
          <View style={[styles.section, { backgroundColor: theme.surface, ...Shadows.sm }]}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Station Details</Text>
            
            {station.phone && (
              <View style={styles.detailRow}>
                <View style={[styles.detailIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                  <Phone size={18} color={theme.text.secondary} />
                </View>
                <View>
                  <Text style={[styles.detailLabel, { color: theme.text.tertiary }]}>Phone</Text>
                  <Text style={[styles.detailValue, { color: theme.text.primary }]}>{station.phone}</Text>
                </View>
              </View>
            )}
            
            <View style={styles.detailRow}>
              <View style={[styles.detailIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                <Clock size={18} color={theme.text.secondary} />
              </View>
              <View>
                <Text style={[styles.detailLabel, { color: theme.text.tertiary }]}>Hours</Text>
                <Text style={[styles.detailValue, { color: theme.text.primary }]}>{station.operatingHours}</Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <View style={[styles.detailIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                <Info size={18} color={theme.text.secondary} />
              </View>
              <View>
                <Text style={[styles.detailLabel, { color: theme.text.tertiary }]}>Fuel Types</Text>
                <Text style={[styles.detailValue, { color: theme.text.primary }]}>
                  {station.fuelTypes.includes('petrol') && station.fuelTypes.includes('diesel') 
                    ? 'Petrol & Diesel' 
                    : station.fuelTypes.includes('petrol') 
                      ? 'Petrol only' 
                      : 'Diesel only'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[4],
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  animatedHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animatedHeaderTitle: {
    flex: 1,
    fontSize: Typography.sizes.lg,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: Spacing[3],
  },
  hero: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[8],
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing[6],
  },
  heroBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    gap: Spacing[3],
  },
  brandTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: Radius.md,
  },
  brandText: {
    color: '#fff',
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stationName: {
    color: '#fff',
    fontSize: Typography.sizes['2xl'],
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  address: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: Typography.sizes.base,
    flex: 1,
  },
  statusCards: {
    flexDirection: 'row',
    gap: Spacing[3],
    marginTop: Spacing[4],
  },
  statusCard: {
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
    borderRadius: Radius.lg,
    ...Shadows.md,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
  },
  queueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
    borderRadius: Radius.lg,
  },
  queueDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  queueText: {
    color: '#fff',
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
  },
  content: {
    padding: Spacing[4],
    gap: Spacing[4],
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: Spacing[4],
    borderRadius: Radius.xl,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: '500',
  },
  statValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
  },
  section: {
    gap: Spacing[3],
  },
  sectionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: '700',
    marginBottom: Spacing[1],
  },
  sectionSubtitle: {
    fontSize: Typography.sizes.sm,
    marginBottom: Spacing[4],
  },
  queueVisualizer: {
    marginTop: Spacing[3],
  },
  queueSegments: {
    flexDirection: 'row',
    gap: Spacing[2],
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  queueSegment: {
    flex: 1,
    borderRadius: 2,
  },
  queueLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing[2],
  },
  queueLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: '500',
  },
  quickReportStack: { gap: Spacing[4] },
  quickBlock: { gap: Spacing[2] },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  queueOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    flex: 1,
    minWidth: 100,
  },
  queueOptionLabel: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
  },
  timeBadge: {
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[0.5],
    borderRadius: Radius.sm,
  },
  timeBadgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
  },
  fuelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    flex: 1,
    minWidth: 100,
  },
  fuelOptionLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: Spacing[8],
    gap: Spacing[3],
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.success.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  successTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: '700',
  },
  successText: {
    fontSize: Typography.sizes.base,
  },
  insightsGrid: {
    flexDirection: 'row',
    gap: Spacing[3],
    marginTop: Spacing[3],
  },
  insightCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    padding: Spacing[4],
    borderRadius: Radius.lg,
  },
  insightIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightValue: {
    fontSize: Typography.sizes.base,
    fontWeight: '700',
  },
  insightLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: '500',
    marginTop: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
  },
  errorText: {
    fontSize: Typography.sizes.xl,
    fontWeight: '600',
  },
});
