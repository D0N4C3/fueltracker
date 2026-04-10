import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
  ScrollView,
} from "react-native";
import MapView, { Marker, Region, Circle } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import {
  Navigation,
  List,
  Zap,
  Fuel,
  User,
  SlidersHorizontal,
  Plus,
  X,
  ChevronUp,
  ChevronDown,
  MapPin,
  Moon,
  Sun,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { useFuel } from "@/context/FuelContext";
import { useLocation } from "@/context/LocationContext";
import { useTheme } from "@/context/ThemeContext";
import { FuelStation, QueueLevel, FuelType } from "@/types";
import { 
  Colors, 
  Radius, 
  Shadows, 
  Spacing, 
  Typography,
  Layout,
  getFuelColor,
  getQueueColor,
} from "@/constants/design";
import { formatTimeAgo } from "@/mocks/stations";
import { StationCard } from "@/components/StationCard";
import { BestStationCard } from "@/components/BestStationCard";
import { FloatingActionButton } from "@/components/AnimatedButton";
import { SkeletonList, SkeletonBestStation } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { QuickReportSheet } from "@/components/QuickReportSheet";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const ASPECT_RATIO = SCREEN_WIDTH / SCREEN_HEIGHT;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const DEFAULT_REGION: Region = {
  latitude: 9.01,
  longitude: 38.76,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

// Calculate distance between two coordinates in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Animated Station Marker
const StationMarker: React.FC<{ 
  station: FuelStation; 
  onPress: () => void;
  isSelected: boolean;
}> = ({ station, onPress, isSelected }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isSelected ? 1.3 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 300,
    }).start();
  }, [isSelected]);

  const fuelColor = getFuelColor(station.currentStatus.fuelAvailable);
  const queueColor = getQueueColor(station.currentStatus.queueLevel);

  return (
    <Marker
      coordinate={{
        latitude: station.latitude,
        longitude: station.longitude,
      }}
      onPress={onPress}
    >
      <Animated.View
        style={[
          styles.markerContainer,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={[styles.marker, { backgroundColor: fuelColor, borderColor: queueColor }]}>
          <Fuel size={16} color="white" />
        </View>
        <View style={styles.markerTail} />
        {isSelected && (
          <View style={[styles.markerPulse, { borderColor: fuelColor }]} />
        )}
      </Animated.View>
    </Marker>
  );
};

// Filter Chip Component
const FilterChip: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
  color?: string;
}> = ({ label, active, onPress, color = Colors.primary[500] }) => {
  const { theme } = useTheme();
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

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={1}
        style={[
          styles.filterChip,
          {
            backgroundColor: active ? color : theme.surface,
            borderColor: active ? color : theme.border,
          },
        ]}
      >
        <Text
          style={[
            styles.filterChipText,
            { color: active ? '#fff' : theme.text.secondary },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Queue Detection Banner
const QueueDetectionBanner: React.FC<{
  visible: boolean;
  stationName?: string;
  onConfirm: () => void;
  onDismiss: () => void;
}> = ({ visible, stationName, onConfirm, onDismiss }) => {
  const { theme } = useTheme();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 100,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: -100,
          useNativeDriver: true,
          friction: 8,
          tension: 100,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.queueBanner,
        {
          backgroundColor: theme.surface,
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
          ...Shadows.lg,
        },
      ]}
    >
      <View style={styles.queueBannerContent}>
        <View style={[styles.queueBannerIcon, { backgroundColor: `${Colors.warning.DEFAULT}20` }]}>
          <Zap size={20} color={Colors.warning.DEFAULT} />
        </View>
        <View style={styles.queueBannerText}>
          <Text style={[styles.queueBannerTitle, { color: theme.text.primary }]}>
            Looks like you're in a queue
          </Text>
          <Text style={[styles.queueBannerSubtitle, { color: theme.text.secondary }]} numberOfLines={1}>
            {stationName}
          </Text>
        </View>
      </View>
      <View style={styles.queueBannerActions}>
        <TouchableOpacity
          style={[styles.queueBannerBtn, { backgroundColor: theme.accent }]}
          onPress={onConfirm}
        >
          <Text style={styles.queueBannerBtnText}>Report</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.queueBannerDismiss, { backgroundColor: theme.surfacePressed }]}
          onPress={onDismiss}
        >
          <X size={16} color={theme.text.secondary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// Main Component
export default function PremiumFuelTrackerHome() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const { stations, isLoading, selectedStation, setSelectedStation, filter, setFilter } = useFuel();
  const { location, isTracking, queueDetection } = useLocation();

  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [showFilters, setShowFilters] = useState(false);
  const [showQuickReport, setShowQuickReport] = useState(false);
  const [bottomSheetExpanded, setBottomSheetExpanded] = useState(false);

  // Animation refs
  const sheetHeight = useRef(new Animated.Value(Layout.bottomSheet.collapsed)).current;
  const filterHeight = useRef(new Animated.Value(0)).current;

  // Calculate distances and find best station
  const stationsWithDistance = useMemo(() => {
    if (!location) return stations.map(s => ({ ...s, distance: undefined }));
    return stations.map(station => ({
      ...station,
      distance: calculateDistance(
        location.latitude,
        location.longitude,
        station.latitude,
        station.longitude
      ),
    }));
  }, [stations, location]);

  const bestStation = useMemo(() => {
    const available = stationsWithDistance.filter(
      s => s.currentStatus.fuelAvailable !== 'none' && s.distance !== undefined
    );
    if (available.length === 0) return null;
    
    // Score stations based on queue level and distance
    return available.sort((a, b) => {
      const queueOrder = { none: 0, short: 1, medium: 2, long: 3, unknown: 4 };
      const aScore = queueOrder[a.currentStatus.queueLevel] * 10 + (a.distance || 0);
      const bScore = queueOrder[b.currentStatus.queueLevel] * 10 + (b.distance || 0);
      return aScore - bScore;
    })[0];
  }, [stationsWithDistance]);

  const filteredStations = useMemo(() => {
    return stationsWithDistance.filter(station => {
      if (filter === 'all') return true;
      if (filter === 'available') return station.currentStatus.fuelAvailable !== 'none';
      if (filter === 'no-queue') return station.currentStatus.queueLevel === 'none';
      if (filter === 'petrol') return ['petrol', 'both'].includes(station.currentStatus.fuelAvailable);
      if (filter === 'diesel') return ['diesel', 'both'].includes(station.currentStatus.fuelAvailable);
      return true;
    });
  }, [stationsWithDistance, filter]);

  const nearbyStations = useMemo(() => {
    // Exclude best station from nearby list
    return filteredStations
      .filter(s => s.id !== bestStation?.id)
      .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
  }, [filteredStations, bestStation]);

  // Handlers
  const handleMarkerPress = useCallback((station: FuelStation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedStation(station);
  }, [setSelectedStation]);

  const handleStationPress = useCallback((station: FuelStation) => {
    router.push(`/station/${station.id}`);
  }, [router]);

  const handleCenterOnUser = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (location) {
      setRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: LATITUDE_DELTA / 3,
        longitudeDelta: LONGITUDE_DELTA / 3,
      });
    }
  }, [location]);

  const toggleFilters = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowFilters(!showFilters);
    Animated.spring(filterHeight, {
      toValue: showFilters ? 0 : 50,
      useNativeDriver: false,
      friction: 8,
      tension: 100,
    }).start();
  }, [showFilters, filterHeight]);

  const expandBottomSheet = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBottomSheetExpanded(true);
    Animated.spring(sheetHeight, {
      toValue: Layout.bottomSheet.expanded,
      useNativeDriver: false,
      friction: 8,
      tension: 100,
    }).start();
  }, [sheetHeight]);

  const collapseBottomSheet = useCallback(() => {
    setBottomSheetExpanded(false);
    Animated.spring(sheetHeight, {
      toValue: Layout.bottomSheet.collapsed,
      useNativeDriver: false,
      friction: 8,
      tension: 100,
    }).start();
  }, [sheetHeight]);

  const toggleBottomSheet = useCallback(() => {
    if (bottomSheetExpanded) {
      collapseBottomSheet();
    } else {
      expandBottomSheet();
    }
  }, [bottomSheetExpanded, collapseBottomSheet, expandBottomSheet]);

  // Effects
  useEffect(() => {
    if (location) {
      setRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
    }
  }, [location]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Map */}
      <MapView
        style={StyleSheet.absoluteFill}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        customMapStyle={isDark ? darkMapStyle : []}
      >
        {filteredStations.map(station => (
          <StationMarker
            key={station.id}
            station={station}
            onPress={() => handleMarkerPress(station)}
            isSelected={selectedStation?.id === station.id}
          />
        ))}
        {location && (
          <Circle
            center={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            radius={100}
            fillColor="rgba(59, 130, 246, 0.1)"
            strokeColor="rgba(59, 130, 246, 0.3)"
            strokeWidth={1}
          />
        )}
      </MapView>

      {/* Header */}
      <BlurView
        intensity={isDark ? 30 : 80}
        tint={isDark ? 'dark' : 'light'}
        style={[styles.header, { paddingTop: insets.top + Spacing[3] }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoSection}>
            <View style={[styles.logo, { backgroundColor: theme.accent }]}>
              <Fuel size={20} color="#fff" />
            </View>
            <View>
              <Text style={[styles.appName, { color: theme.text.primary }]}>FuelFinder</Text>
              <Text style={[styles.appSubtitle, { color: theme.text.tertiary }]}>Ethiopia</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
              onPress={toggleTheme}
            >
              {isDark ? <Sun size={20} color={theme.text.primary} /> : <Moon size={20} color={theme.text.primary} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
              onPress={() => router.push('/stations')}
            >
              <List size={20} color={theme.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
              onPress={() => router.push('/profile')}
            >
              <User size={20} color={theme.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                {
                  backgroundColor: showFilters ? theme.accent : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                },
              ]}
              onPress={toggleFilters}
            >
              <SlidersHorizontal size={20} color={showFilters ? '#fff' : theme.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filters */}
        <Animated.View style={[styles.filtersContainer, { height: filterHeight, opacity: showFilters ? 1 : 0 }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            <FilterChip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
            <FilterChip label="Available" active={filter === 'available'} onPress={() => setFilter('available')} color={Colors.fuel.available} />
            <FilterChip label="No Queue" active={filter === 'no-queue'} onPress={() => setFilter('no-queue')} color={Colors.queue.none} />
            <FilterChip label="Petrol" active={filter === 'petrol'} onPress={() => setFilter('petrol')} color={Colors.fuel.petrol} />
            <FilterChip label="Diesel" active={filter === 'diesel'} onPress={() => setFilter('diesel')} color={Colors.fuel.diesel} />
          </ScrollView>
        </Animated.View>
      </BlurView>

      {/* Queue Detection Banner */}
      <QueueDetectionBanner
        visible={queueDetection.isInQueue && !!queueDetection.stationId}
        stationName={stations.find(s => s.id === queueDetection.stationId)?.name}
        onConfirm={() => {
          const station = stations.find(s => s.id === queueDetection.stationId);
          if (station) {
            setShowQuickReport(true);
          }
        }}
        onDismiss={() => {}}
      />

      {/* Location Button */}
      <TouchableOpacity
        style={[
          styles.locationButton,
          {
            bottom: Layout.bottomSheet.collapsed + insets.bottom + Spacing[4],
            backgroundColor: theme.surface,
          },
        ]}
        onPress={handleCenterOnUser}
      >
        <Navigation size={20} color={theme.accent} />
      </TouchableOpacity>

      {/* FAB */}
      <View style={[styles.fabContainer, { bottom: insets.bottom + Layout.bottomSheet.collapsed + Spacing[4] }]}>
        <FloatingActionButton
          onPress={() => setShowQuickReport(true)}
          icon={<Plus size={24} />}
          variant="primary"
        />
      </View>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.bottomSheet,
          {
            height: sheetHeight,
            backgroundColor: theme.surface,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {/* Sheet Handle */}
        <TouchableOpacity
          style={styles.sheetHandle}
          onPress={toggleBottomSheet}
          activeOpacity={1}
        >
          <View style={[styles.handleBar, { backgroundColor: isDark ? '#475569' : '#cbd5e1' }]} />
          {bottomSheetExpanded ? (
            <ChevronDown size={20} color={theme.text.tertiary} />
          ) : (
            <ChevronUp size={20} color={theme.text.tertiary} />
          )}
        </TouchableOpacity>

        {/* Sheet Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetContent}
          scrollEnabled={bottomSheetExpanded}
        >
          {isLoading ? (
            <>
              <SkeletonBestStation />
              <SkeletonList count={3} />
            </>
          ) : filteredStations.length === 0 ? (
            <EmptyState
              type="no-results"
              onAction={() => setFilter('all')}
            />
          ) : (
            <>
              {/* Best Station Card */}
              {bestStation && (
                <>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
                      Best Nearby Station
                    </Text>
                    <Text style={[styles.sectionSubtitle, { color: theme.text.secondary }]}>
                      Based on queue & distance
                    </Text>
                  </View>
                  <BestStationCard
                    station={bestStation}
                    distance={bestStation.distance}
                    onPress={handleStationPress}
                  />
                </>
              )}

              {/* Nearby Stations */}
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
                  Nearby Stations
                </Text>
                <Text style={[styles.sectionSubtitle, { color: theme.text.secondary }]}>
                  {nearbyStations.length} stations found
                </Text>
              </View>

              {nearbyStations.map(station => (
                <StationCard
                  key={station.id}
                  station={station}
                  distance={station.distance}
                  onPress={handleStationPress}
                />
              ))}
            </>
          )}
        </ScrollView>
      </Animated.View>

      {/* Quick Report Sheet */}
      <QuickReportSheet
        visible={showQuickReport}
        onClose={() => setShowQuickReport(false)}
        station={selectedStation || undefined}
      />
    </View>
  );
}

// Dark map style
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#64779e' }] },
  { featureType: 'administrative.province', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry.stroke', stylers: [{ color: '#334e87' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#023e58' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#283d6a' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6f9ba5' }] },
  { featureType: 'poi', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
  { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#023e58' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#3C7680' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c6675' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#255763' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#b0d5ce' }] },
  { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'transit', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
  { featureType: 'transit.line', elementType: 'geometry.fill', stylers: [{ color: '#283d6a' }] },
  { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#3a4762' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e6d70' }] },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2.5],
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  appName: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
  },
  appSubtitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing[1.5],
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersContainer: {
    overflow: 'hidden',
  },
  filtersScroll: {
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[3],
    gap: Spacing[2],
  },
  filterChip: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    borderWidth: 1,
    marginRight: Spacing[2],
  },
  filterChipText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
  },
  queueBanner: {
    position: 'absolute',
    top: 100,
    left: Spacing[4],
    right: Spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing[4],
    borderRadius: Radius.xl,
    zIndex: 20,
  },
  queueBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    flex: 1,
  },
  queueBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queueBannerText: {
    flex: 1,
  },
  queueBannerTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    marginBottom: 2,
  },
  queueBannerSubtitle: {
    fontSize: Typography.sizes.xs,
  },
  queueBannerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  queueBannerBtn: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: Radius.lg,
  },
  queueBannerBtnText: {
    color: '#fff',
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
  },
  queueBannerDismiss: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    ...Shadows.md,
  },
  markerTail: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(0,0,0,0.3)',
    marginTop: -4,
  },
  markerPulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    opacity: 0.5,
  },
  locationButton: {
    position: 'absolute',
    right: Spacing[4],
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
    zIndex: 5,
  },
  fabContainer: {
    position: 'absolute',
    right: Spacing[4],
    zIndex: 5,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    ...Shadows['2xl'],
    zIndex: 10,
    overflow: 'hidden',
  },
  sheetHandle: {
    alignItems: 'center',
    paddingVertical: Spacing[2],
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing[2],
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  sheetContent: {
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[6],
  },
  sectionHeader: {
    marginTop: Spacing[4],
    marginBottom: Spacing[3],
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: Typography.sizes.sm,
    marginTop: 2,
  },
});
