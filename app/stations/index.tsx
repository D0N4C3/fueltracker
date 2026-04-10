import React, { useState, useMemo, useCallback } from "react";
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Search, SlidersHorizontal, Fuel, X } from "lucide-react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "@/context/ThemeContext";
import { useFuel } from "@/context/FuelContext";
import { useLocation } from "@/context/LocationContext";
import { FuelStation } from "@/types";
import { Radius, Shadows, Spacing, Typography, Colors } from "@/constants/design";
import { ThemeColors } from "@/constants/colors";
import { StationCard } from "@/components/StationCard";
import { SkeletonList } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import * as Haptics from "expo-haptics";

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

const FilterChip: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
  color?: string;
}> = ({ label, active, onPress, color }) => {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity
      style={[
        styles.filterChip,
        {
          backgroundColor: active ? (color || theme.accent) : theme.surface,
          borderColor: active ? (color || theme.accent) : theme.border,
        },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.filterChipText, { color: active ? '#fff' : theme.text.secondary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const SortOption: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity
      style={[styles.sortOption, { backgroundColor: active ? `${theme.accent}15` : 'transparent' }]}
      onPress={onPress}
    >
      <Text style={[styles.sortOptionText, { color: active ? theme.accent : theme.text.secondary }]}>
        {label}
      </Text>
      {active && <View style={[styles.sortIndicator, { backgroundColor: theme.accent }]} />}
    </TouchableOpacity>
  );
};

export default function StationsListPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { stations, isLoading, refreshStations, filter, setFilter } = useFuel();
  const { location } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'distance' | 'queue' | 'updated'>('distance');

  const stationsWithDistance = useMemo(() => {
    if (!location) return stations.map(s => ({ ...s, distance: undefined as number | undefined }));
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

  const filteredStations = useMemo(() => {
    let result = stationsWithDistance.filter(station => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          station.name.toLowerCase().includes(query) ||
          station.address.toLowerCase().includes(query) ||
          station.brand.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (filter === 'available') return station.currentStatus.fuelAvailable !== 'none';
      if (filter === 'no-queue') return station.currentStatus.queueLevel === 'none';
      if (filter === 'petrol') return ['petrol', 'both'].includes(station.currentStatus.fuelAvailable);
      if (filter === 'diesel') return ['diesel', 'both'].includes(station.currentStatus.fuelAvailable);
      
      return true;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return (a.distance || Infinity) - (b.distance || Infinity);
        case 'queue':
          const queueOrder = { none: 0, short: 1, medium: 2, long: 3, unknown: 4 };
          return queueOrder[a.currentStatus.queueLevel] - queueOrder[b.currentStatus.queueLevel];
        case 'updated':
          return b.currentStatus.lastUpdated.getTime() - a.currentStatus.lastUpdated.getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [stationsWithDistance, searchQuery, filter, sortBy]);

  const handleStationPress = useCallback((station: FuelStation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/station/${station.id}`);
  }, [router]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filter !== 'all') count++;
    if (searchQuery) count++;
    return count;
  }, [filter, searchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BlurView
        intensity={isDark ? 30 : 80}
        tint={isDark ? 'dark' : 'light'}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={[styles.headerBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} 
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={theme.text.primary} />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: theme.text.primary }]}>All Stations</Text>
            <Text style={[styles.headerSubtitle, { color: theme.text.tertiary }]}>
              {filteredStations.length} stations found
            </Text>
          </View>

          <TouchableOpacity 
            style={[
              styles.headerBtn, 
              { 
                backgroundColor: showFilters ? theme.accent : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              }
            ]} 
            onPress={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={20} color={showFilters ? '#fff' : theme.text.primary} />
            {activeFiltersCount > 0 && (
              <View style={[styles.badge, { backgroundColor: showFilters ? '#fff' : Colors.error.DEFAULT }]}>
                <Text style={[styles.badgeText, { color: showFilters ? theme.accent : '#fff' }]}>
                  {activeFiltersCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: theme.surface }]}>
          <Search size={20} color={theme.text.tertiary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text.primary }]}
            placeholder="Search stations..."
            placeholderTextColor={theme.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={18} color={theme.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>

        {showFilters && (
          <View style={styles.filtersSection}>
            <View style={styles.filterChips}>
              <FilterChip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
              <FilterChip label="Available" active={filter === 'available'} onPress={() => setFilter('available')} color={Colors.fuel.available} />
              <FilterChip label="No Queue" active={filter === 'no-queue'} onPress={() => setFilter('no-queue')} color={Colors.queue.none} />
              <FilterChip label="Petrol" active={filter === 'petrol'} onPress={() => setFilter('petrol')} color={Colors.fuel.petrol} />
              <FilterChip label="Diesel" active={filter === 'diesel'} onPress={() => setFilter('diesel')} color={Colors.fuel.diesel} />
            </View>

            <Text style={[styles.sortTitle, { color: theme.text.secondary }]}>Sort by</Text>
            <View style={styles.sortOptions}>
              <SortOption label="Distance" active={sortBy === 'distance'} onPress={() => setSortBy('distance')} />
              <SortOption label="Queue" active={sortBy === 'queue'} onPress={() => setSortBy('queue')} />
              <SortOption label="Last Updated" active={sortBy === 'updated'} onPress={() => setSortBy('updated')} />
            </View>
          </View>
        )}
      </BlurView>

      {isLoading ? (
        <SkeletonList count={5} />
      ) : filteredStations.length === 0 ? (
        <EmptyState type={searchQuery ? 'no-results' : 'no-stations'} onAction={searchQuery ? clearSearch : () => setFilter('all')} />
      ) : (
        <FlatList
          data={filteredStations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <StationCard station={item} distance={item.distance} onPress={handleStationPress} />
          )}
          contentContainerStyle={{
            paddingTop: Spacing[4],
            paddingBottom: insets.bottom + Spacing[4],
          }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: Spacing[2] }} />}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshStations} tintColor={theme.accent} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ThemeColors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: ThemeColors.surface, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: ThemeColors.text, textAlign: 'center' },
  placeholder: { width: 40 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: ThemeColors.surface, marginHorizontal: 20, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 8, borderWidth: 1, borderColor: ThemeColors.border },
  searchInput: { flex: 1, fontSize: 15, color: ThemeColors.text },
  listContent: { padding: 20, gap: 12 },
  card: { backgroundColor: ThemeColors.surface, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardTitleSection: { flex: 1, marginRight: 12 },
  brandText: { fontSize: 11, color: ThemeColors.primary, fontWeight: '600', textTransform: 'uppercase' },
  stationName: { fontSize: 16, fontWeight: '600', color: ThemeColors.text, marginTop: 2 },
  fuelBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  fuelBadgeText: { fontSize: 10, color: 'white', fontWeight: '600' },
  cardBody: { gap: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addressText: { fontSize: 13, color: ThemeColors.textSecondary, flex: 1 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  divider: { width: 1, height: 14, backgroundColor: ThemeColors.border },
  queueIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  queueDot: { width: 8, height: 8, borderRadius: 4 },
  queueText: { fontSize: 12, fontWeight: '500' },
  trendContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trendText: { fontSize: 11, fontWeight: '500' },
  timeContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { fontSize: 11, color: ThemeColors.textMuted },
  distanceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  distanceText: { fontSize: 12, color: ThemeColors.primary, fontWeight: '500' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: ThemeColors.text, marginTop: 16 },
});
// TIMESTAMP_1775756619
