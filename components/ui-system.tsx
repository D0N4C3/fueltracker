import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Layout, Radius, Shadows, Spacing, Typography } from '@/constants/design';

export const IconButton: React.FC<{
  onPress?: () => void;
  icon: React.ReactNode;
  active?: boolean;
  inverted?: boolean;
  style?: ViewStyle;
}> = ({ onPress, icon, active = false, inverted = false, style }) => {
  const { theme } = useTheme();
  const baseBg = inverted ? 'rgba(255,255,255,0.22)' : theme.surfaceElevated;
  const activeBg = inverted ? 'rgba(255,255,255,0.32)' : theme.accent;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.iconButton,
        {
          backgroundColor: active ? activeBg : baseBg,
          borderColor: inverted ? 'rgba(255,255,255,0.28)' : theme.border,
        },
        style,
      ]}
    >
      {icon}
    </TouchableOpacity>
  );
};

export const ScreenHeader: React.FC<{
  title: string;
  subtitle?: string;
  leftAction?: React.ReactNode;
  rightActions?: React.ReactNode;
  centerTitle?: boolean;
}> = ({ title, subtitle, leftAction, rightActions, centerTitle = false }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.headerRow}>
      <View style={styles.edgeAction}>{leftAction}</View>
      <View style={[styles.headerTitleBlock, centerTitle && styles.headerTitleCentered]}>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={[styles.headerSubtitle, { color: theme.text.tertiary }]}>{subtitle}</Text> : null}
      </View>
      <View style={[styles.edgeAction, styles.edgeActionEnd]}>{rightActions}</View>
    </View>
  );
};

export const PanelCard: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
}> = ({ children, style }) => {
  const { theme } = useTheme();
  return <View style={[styles.panelCard, { backgroundColor: theme.surface, borderColor: theme.border }, style]}>{children}</View>;
};

export const StatusPill: React.FC<{
  label: string;
  color: string;
  subtle?: boolean;
}> = ({ label, color, subtle = true }) => {
  return (
    <View style={[styles.statusPill, { backgroundColor: subtle ? `${color}1F` : color }]}> 
      <View style={[styles.statusDot, { backgroundColor: subtle ? color : '#fff' }]} />
      <Text style={[styles.statusLabel, { color: subtle ? color : '#fff' }]}>{label}</Text>
    </View>
  );
};

export const MetricRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.metricRow}>
      <View style={styles.metricIcon}>{icon}</View>
      <Text style={[styles.metricValue, { color: theme.text.primary }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: theme.text.tertiary }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    width: Layout.header.iconButtonSize,
    height: Layout.header.iconButtonSize,
    borderRadius: Radius.tiers.component,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.compact.md },
  edgeAction: { minWidth: Layout.header.iconButtonSize },
  edgeActionEnd: { alignItems: 'flex-end' },
  headerTitleBlock: { flex: 1, gap: 2 },
  headerTitleCentered: { alignItems: 'center' },
  headerTitle: { fontSize: Typography.roles.subtitle.lg, fontWeight: '700' },
  headerSubtitle: { fontSize: Typography.roles.meta.md, fontWeight: '500' },
  panelCard: {
    borderWidth: 1,
    borderRadius: Radius.tiers.panel,
    padding: Spacing.rhythm.sm,
    ...Shadows.sm,
  },
  statusPill: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.compact.lg,
    paddingVertical: Spacing.compact.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.compact.xs,
    alignSelf: 'flex-start',
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: Typography.roles.meta.lg, fontWeight: '700' },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.compact.sm },
  metricIcon: { width: 16, alignItems: 'center' },
  metricValue: { fontSize: Typography.roles.body.md, fontWeight: '600' },
  metricLabel: { fontSize: Typography.roles.meta.md, fontWeight: '500' },
});
