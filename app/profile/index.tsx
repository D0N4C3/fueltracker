import React, { useState, useCallback } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ChevronLeft, Moon, Bell, MapPin, Shield,
  Info, FileText, Star, ChevronRight, Zap,
  User, Settings
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/context/ThemeContext";
import { Radius, Shadows, Spacing, Typography, Colors } from "@/constants/design";
import * as Haptics from "expo-haptics";
import { IconButton, PanelCard, ScreenHeader } from "@/components/ui-system";

const SettingsItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}> = ({ icon, title, subtitle, onPress, rightElement }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity style={[styles.settingsItem, { borderBottomColor: theme.borderSubtle }]} onPress={onPress} disabled={!onPress && !rightElement}>
      <View style={[styles.settingsIcon, { backgroundColor: theme.surfacePressed }]}>
        {React.cloneElement(icon as React.ReactElement, { color: theme.accent })}
      </View>
      <View style={styles.settingsContent}>
        <Text style={[styles.settingsTitle, { color: theme.text.primary }]}>{title}</Text>
        {subtitle ? <Text style={[styles.settingsSubtitle, { color: theme.text.tertiary }]}>{subtitle}</Text> : null}
      </View>
      {rightElement || (onPress ? <ChevronRight size={16} color={theme.text.tertiary} /> : null)}
    </TouchableOpacity>
  );
};

const StatCard = ({ value, label, icon, color }: { value: string; label: string; icon: React.ReactNode; color: string }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.border, ...Shadows.sm }]}>
      <View style={[styles.statIcon, { backgroundColor: `${color}18` }]}>{React.cloneElement(icon as React.ReactElement, { color, size: 14 })}</View>
      <Text style={[styles.statValue, { color: theme.text.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.text.tertiary }]}>{label}</Text>
    </View>
  );
};

export default function ProfilePage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [smartDetection, setSmartDetection] = useState(true);

  const handleGoBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <LinearGradient
        colors={isDark ? ['#182644', '#0e1729'] : ['#dde6ff', '#f4f6fb']}
        style={[styles.hero, { paddingTop: insets.top + Spacing[1] }]}
      >
        <View style={styles.header}>
          <ScreenHeader
            title="Profile"
            centerTitle
            leftAction={<IconButton onPress={handleGoBack} icon={<ChevronLeft size={22} color={theme.text.primary} />} />}
            rightActions={<IconButton icon={<Settings size={18} color={theme.text.primary} />} />}
          />
        </View>

        <PanelCard style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: theme.surfacePressed }]}><User size={38} color={theme.text.secondary} /></View>
          <Text style={[styles.userName, { color: theme.text.primary }]}>Fuel Finder User</Text>
          <Text style={[styles.userSubtitle, { color: theme.text.tertiary }]}>Community Contributor</Text>
          <View style={styles.statsRow}>
            <StatCard value="12" label="Reports" icon={<FileText size={18} />} color={Colors.info.DEFAULT} />
            <StatCard value="48" label="Helpful" icon={<Star size={18} />} color={Colors.warning.DEFAULT} />
            <StatCard value="156" label="Points" icon={<Zap size={18} />} color={Colors.success.DEFAULT} />
          </View>
        </PanelCard>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing[4], paddingTop: Spacing[3], paddingBottom: insets.bottom + Spacing[5], gap: Spacing[3] }}>
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border, ...Shadows.sm }]}>
          <Text style={[styles.sectionTitle, { color: theme.text.tertiary }]}>QUICK CONTROLS</Text>
          <SettingsItem icon={<User size={18} />} title="Edit Profile" subtitle="Update your name and details" onPress={() => Alert.alert('Edit profile', 'Profile editing coming soon.')} />
          <SettingsItem icon={<Bell size={18} />} title="Notifications" subtitle="Nearby station and queue alerts" rightElement={<Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: theme.border, true: theme.accent }} thumbColor="#fff" />} />
          <SettingsItem icon={<Moon size={18} />} title="Theme" subtitle={isDark ? 'Dark mode' : 'Light mode'} rightElement={<Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: theme.border, true: theme.accent }} thumbColor="#fff" />} />
        </View>

        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border, ...Shadows.sm }]}>
          <Text style={[styles.sectionTitle, { color: theme.text.tertiary }]}>PREFERENCES</Text>
          <SettingsItem icon={<MapPin size={18} />} title="Smart Queue Detection" subtitle="Auto-detect when you're in a queue" rightElement={<Switch value={smartDetection} onValueChange={setSmartDetection} trackColor={{ false: theme.border, true: theme.accent }} thumbColor="#fff" />} />
        </View>

        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border, ...Shadows.sm }]}> 
          <Text style={[styles.sectionTitle, { color: theme.text.tertiary }]}>ABOUT</Text>
          <SettingsItem icon={<Info size={18} />} title="About FuelFinder" subtitle="Version 1.0.0" onPress={() => Alert.alert('About', 'FuelFinder Ethiopia v1.0.0')} />
          <SettingsItem icon={<Shield size={18} />} title="Privacy Policy" onPress={() => Alert.alert('Privacy', 'Your privacy is important to us.')} />
          <SettingsItem icon={<FileText size={18} />} title="Terms of Service" onPress={() => Alert.alert('Terms', 'By using FuelFinder, you agree to our terms.')} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { paddingHorizontal: Spacing[4], paddingBottom: Spacing[4] },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing[4] },
  profileCard: { borderWidth: 1, borderRadius: Radius['2xl'], padding: Spacing[5], alignItems: 'center', gap: Spacing[2] },
  avatar: { width: 92, height: 92, borderRadius: 46, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing[1] },
  userName: { fontSize: Typography.sizes['2xl'], fontWeight: '700' },
  userSubtitle: { fontSize: Typography.sizes.base, marginBottom: Spacing[2] },
  statsRow: { flexDirection: 'row', gap: Spacing[2], width: '100%' },
  statCard: { flex: 1, borderWidth: 1, borderRadius: Radius.lg, paddingVertical: Spacing[3], alignItems: 'center', gap: 6 },
  statIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: Typography.sizes.xl, fontWeight: '700' },
  statLabel: { fontSize: Typography.sizes.sm, fontWeight: '500' },
  section: { borderWidth: 1, borderRadius: Radius.xl, overflow: 'hidden' },
  sectionTitle: { fontSize: Typography.sizes.sm, fontWeight: '700', letterSpacing: 0.8, marginHorizontal: Spacing[4], marginTop: Spacing[4], marginBottom: Spacing[2] },
  settingsItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing[4], paddingVertical: Spacing[3], borderBottomWidth: 1, gap: Spacing[3] },
  settingsIcon: { width: 42, height: 42, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  settingsContent: { flex: 1 },
  settingsTitle: { fontSize: Typography.sizes.base, fontWeight: '600' },
  settingsSubtitle: { fontSize: Typography.sizes.xs, marginTop: 1 },
});
