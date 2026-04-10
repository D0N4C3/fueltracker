import React, { useState, useMemo, useCallback } from "react";
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Search, SlidersHorizontal, X } from "lucide-react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "@/context/ThemeContext";
import { useFuel } from "@/context/FuelContext";
import { useLocation } from "@/context/LocationContext";
import { FuelStation } from "@/types";
import { Radius, Spacing, Typography, Colors, Shadows } from "@/constants/design";
import { StationCard } from "@/components/StationCard";
import { SkeletonList } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { IconButton, ScreenHeader } from "@/components/ui-system";
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
  const { theme, isDark } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.filterChip,
        {
          backgroundColor: active ? (color || theme.accent) : theme.surface,
          borderColor: active ? (color || theme.accent) : theme.border,
          ...(active ? Shadows.sm : {}),
        },
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Text style={[styles.filterChipText, { color: active ? '#fff' : isDark ? theme.text.secondary : theme.text.primary }]}>
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
      style={[
        styles.sortOption,
        {
          backgroundColor: active ? `${theme.accent}16` : theme.surface,
          borderColor: active ? `${theme.accent}50` : theme.border,
        },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.sortOptionText, { color: active ? theme.accent : theme.text.secondary }]}> 
        {label}
      </Text>
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
    if (!location) return stations.map((s) => ({ ...s, distance: undefined as number | undefined }));
    return stations.map((station) => ({
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
    const result = stationsWithDistance.filter((station) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
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
        intensity={isDark ? 30 : 90}
        tint={isDark ? 'dark' : 'light'}
        style={[styles.header, { paddingTop: insets.top + Spacing[2] }]}
      >
        <View style={styles.headerContent}>
          <ScreenHeader
            title="Stations"
            subtitle={`${filteredStations.length} matching`}
            centerTitle
            leftAction={<IconButton onPress={() => router.back()} icon={<ChevronLeft size={22} color={theme.text.primary} />} />}
            rightActions={
              <View>
                <IconButton
                  onPress={() => setShowFilters(!showFilters)}
                  active={showFilters}
                  icon={<SlidersHorizontal size={18} color={showFilters ? '#fff' : theme.text.primary} />}
                />
                {activeFiltersCount > 0 && (
                  <View style={[styles.badge, { backgroundColor: showFilters ? '#fff' : Colors.error.DEFAULT }]}>
                    <Text style={[styles.badgeText, { color: showFilters ? theme.accent : '#fff' }]}>
                      {activeFiltersCount}
                    </Text>
                  </View>
                )}
              </View>
            }
          />
        </View>

        <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Search size={18} color={theme.text.tertiary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text.primary }]}
            placeholder="Search by name, brand, area"
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
            <View style={styles.filterRow}>
              <FilterChip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
              <FilterChip label="Available" active={filter === 'available'} onPress={() => setFilter('available')} color={Colors.fuel.available} />
              <FilterChip label="No Queue" active={filter === 'no-queue'} onPress={() => setFilter('no-queue')} color={Colors.queue.none} />
              <FilterChip label="Petrol" active={filter === 'petrol'} onPress={() => setFilter('petrol')} color={Colors.fuel.petrol} />
              <FilterChip label="Diesel" active={filter === 'diesel'} onPress={() => setFilter('diesel')} color={Colors.fuel.diesel} />
            </View>

            <Text style={[styles.sortTitle, { color: theme.text.secondary }]}>Sort</Text>
            <View style={styles.sortOptions}>
              <SortOption label="Distance" active={sortBy === 'distance'} onPress={() => setSortBy('distance')} />
              <SortOption label="Queue" active={sortBy === 'queue'} onPress={() => setSortBy('queue')} />
              <SortOption label="Updated" active={sortBy === 'updated'} onPress={() => setSortBy('updated')} />
            </View>
          </View>
        )}
      </BlurView>

      {isLoading ? (
        <SkeletonList count={5} />
      ) : filteredStations.length === 0 ? (
        <EmptyState
          type={searchQuery ? 'no-results' : 'no-stations'}
          onAction={searchQuery ? clearSearch : () => setFilter('all')}
        />
      ) : (
        <FlatList
          data={filteredStations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <StationCard station={item} distance={item.distance} onPress={handleStationPress} />
          )}
          contentContainerStyle={{
            paddingTop: Spacing[3],
            paddingBottom: insets.bottom + Spacing[6],
          }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: Spacing[1] }} />}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshStations} tintColor={theme.accent} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[4],
    borderBottomLeftRadius: Radius['2xl'],
    borderBottomRightRadius: Radius['2xl'],
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
    marginBottom: Spacing[3],
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2.5],
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.sizes.base,
    marginLeft: Spacing[2],
  },
  filtersSection: {
    marginTop: Spacing[3],
    gap: Spacing[3],
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  filterChip: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
  },
  sortTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  sortOption: {
    flex: 1,
    borderRadius: Radius.lg,
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[2.5],
    borderWidth: 1,
    alignItems: 'center',
  },
  sortOptionText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
  },
});
