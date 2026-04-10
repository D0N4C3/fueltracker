import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MapPin, Fuel, Search, AlertCircle, Navigation } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { Radius, Spacing, Typography } from '@/constants/design';
import { AnimatedButton } from './AnimatedButton';

interface EmptyStateProps {
  type: 'no-stations' | 'no-results' | 'no-location' | 'error' | 'offline';
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  onAction,
  style,
}) => {
  const { theme, isDark } = useTheme();

  const configs = {
    'no-stations': {
      icon: <Fuel size={48} color={theme.text.tertiary} />,
      title: 'No stations nearby',
      message: 'We couldn\'t find any fuel stations in your area. Try expanding your search radius.',
      actionLabel: 'Refresh',
    },
    'no-results': {
      icon: <Search size={48} color={theme.text.tertiary} />,
      title: 'No matching stations',
      message: 'Try adjusting your filters to see more results.',
      actionLabel: 'Clear Filters',
    },
    'no-location': {
      icon: <Navigation size={48} color={theme.text.tertiary} />,
      title: 'Location needed',
      message: 'Enable location services to find nearby fuel stations and track queues.',
      actionLabel: 'Enable Location',
    },
    'error': {
      icon: <AlertCircle size={48} color={theme.text.tertiary} />,
      title: 'Something went wrong',
      message: 'We couldn\'t load the station data. Please try again.',
      actionLabel: 'Try Again',
    },
    'offline': {
      icon: <MapPin size={48} color={theme.text.tertiary} />,
      title: 'You\'re offline',
      message: 'Check your internet connection to get the latest fuel station updates.',
      actionLabel: 'Retry',
    },
  };

  const config = configs[type];

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
        {config.icon}
      </View>
      
      <Text style={[styles.title, { color: theme.text.primary }]}>
        {config.title}
      </Text>
      
      <Text style={[styles.message, { color: theme.text.secondary }]}>
        {config.message}
      </Text>

      {onAction && (
        <AnimatedButton
          onPress={onAction}
          variant="secondary"
          style={styles.actionButton}
        >
          {config.actionLabel}
        </AnimatedButton>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[8],
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: Radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[6],
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing[3],
  },
  message: {
    fontSize: Typography.sizes.base,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing[6],
    maxWidth: 280,
  },
  actionButton: {
    minWidth: 160,
  },
});
