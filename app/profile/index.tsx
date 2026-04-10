import React, { useState, useCallback } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { 
  ChevronLeft, Moon, Bell, MapPin, Shield, 
  Info, FileText, Star, ChevronRight, Zap,
  User, Settings, LogOut
} from "lucide-react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/context/ThemeContext";
import { Radius, Shadows, Spacing, Typography, Colors } from "@/constants/design";
import { AnimatedButton } from "@/components/AnimatedButton";
import * as Haptics from "expo-haptics";

// Settings Item Component
const SettingsItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
}> = ({ icon, title, subtitle, onPress, rightElement, destructive }) => {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity 
      style={[styles.settingsItem, { borderBottomColor: theme.border }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.settingsIcon, { backgroundColor: destructive ? `${Colors.error.DEFAULT}15` : `${theme.accent}15` }]}>
        {React.cloneElement(icon as React.ReactElement, { 
          color: destructive ? Colors.error.DEFAULT : theme.accent 
        })}
      </View>
      <View style={styles.settingsContent}>
        <Text style={[styles.settingsTitle, { color: destructive ? Colors.error.DEFAULT : theme.text.primary }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingsSubtitle, { color: theme.text.tertiary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement || (onPress && <ChevronRight size={20} color={theme.text.tertiary} />)}
    </TouchableOpacity>
  );
};

// Stats Card Component
const StatCard: React.FC<{
  value: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}> = ({ value, label, icon, color }) => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.statCard, { backgroundColor: theme.surface, ...Shadows.sm }]}>
      <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
        {React.cloneElement(icon as React.ReactElement, { color })}
      </View>
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
  const [radius, setRadius] = useState(5);

  const handleGoBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleToggleNotifications = useCallback((value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotifications(value);
  }, []);

  const handleToggleSmartDetection = useCallback((value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSmartDetection(value);
  }, []);

  const handleClearData = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all saved data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'All data has been cleared');
          }
        },
      ]
    );
  }, []);

  const gradientColors = isDark 
    ? [Colors.primary[900], Colors.primary[800]] as const
    : [Colors.primary[600], Colors.primary[500]] as const;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Background */}
      <LinearGradient
        colors={gradientColors}
        style={[styles.headerBg, { paddingTop: insets.top }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.headerBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]} 
            onPress={handleGoBack}
          >
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity 
            style={[styles.headerBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
          >
            <Settings size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={40} color="#fff" />
            </View>
            <View style={styles.statusBadge}>
              <Zap size={14} color="#fff" />
            </View>
          </View>
          
          <Text style={styles.userName}>Fuel Finder User</Text>
          <Text style={styles.userSubtitle}>Community Contributor</Text>
          
          {/* Stats */}
          <View style={styles.statsRow}>
            <StatCard 
              value="12" 
              label="Reports" 
              icon={<FileText size={20} />}
              color={Colors.info.DEFAULT}
            />
            <StatCard 
              value="48" 
              label="Helpful" 
              icon={<Star size={20} />}
              color={Colors.warning.DEFAULT}
            />
            <StatCard 
              value="156" 
              label="Points" 
              icon={<Zap size={20} />}
              color={Colors.success.DEFAULT}
            />
          </View>
        </View>
      </LinearGradient>

      {/* Settings */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing[6] }}
      >
        <View style={[styles.settingsSection, { backgroundColor: theme.surface, ...Shadows.sm }]}>
          <Text style={[styles.sectionTitle, { color: theme.text.tertiary }]}>APPEARANCE</Text>
          
          <SettingsItem
            icon={<Moon size={20} />}
            title="Dark Mode"
            subtitle={isDark ? 'Enabled' : 'Disabled'}
            rightElement={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.border, true: Colors.primary[500] }}
                thumbColor="#fff"
              />
            }
          />
        </View>

        <View style={[styles.settingsSection, { backgroundColor: theme.surface, ...Shadows.sm }]}>
          <Text style={[styles.sectionTitle, { color: theme.text.tertiary }]}>NOTIFICATIONS</Text>
          
          <SettingsItem
            icon={<Bell size={20} />}
            title="Push Notifications"
            subtitle="Get alerts about nearby stations"
            rightElement={
              <Switch
                value={notifications}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: theme.border, true: Colors.primary[500] }}
                thumbColor="#fff"
              />
            }
          />
          
          <SettingsItem
            icon={<MapPin size={20} />}
            title="Smart Queue Detection"
            subtitle="Auto-detect when you're in a queue"
            rightElement={
              <Switch
                value={smartDetection}
                onValueChange={handleToggleSmartDetection}
                trackColor={{ false: theme.border, true: Colors.primary[500] }}
                thumbColor="#fff"
              />
            }
          />
        </View>

        <View style={[styles.settingsSection, { backgroundColor: theme.surface, ...Shadows.sm }]}>
          <Text style={[styles.sectionTitle, { color: theme.text.tertiary }]}>ABOUT</Text>
          
          <SettingsItem
            icon={<Info size={20} />}
            title="About FuelFinder"
            subtitle="Version 1.0.0"
            onPress={() => Alert.alert('About', 'FuelFinder Ethiopia v1.0.0\n\nHelping you find fuel faster.')}
          />
          
          <SettingsItem
            icon={<Shield size={20} />}
            title="Privacy Policy"
            onPress={() => Alert.alert('Privacy', 'Your privacy is important to us. We only collect location data to provide fuel station information.')}
          />
          
          <SettingsItem
            icon={<FileText size={20} />}
            title="Terms of Service"
            onPress={() => Alert.alert('Terms', 'By using FuelFinder, you agree to our terms of service.')}
          />
        </View>

        <View style={[styles.settingsSection, { backgroundColor: theme.surface, ...Shadows.sm }]}>
          <Text style={[styles.sectionTitle, { color: theme.text.tertiary }]}>ACCOUNT</Text>
          
          <SettingsItem
            icon={<LogOut size={20} />}
            title="Clear All Data"
            subtitle="Remove all saved preferences"
            destructive
            onPress={handleClearData}
          />
        </View>

        <Text style={[styles.version, { color: theme.text.tertiary }]}>
          FuelFinder Ethiopia v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBg: {
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[8],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing[3],
    marginBottom: Spacing[4],
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
    color: '#fff',
  },
  profileCard: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing[4],
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.success.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    ...Shadows.md,
  },
  userName: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: '700',
    color: '#fff',
    marginBottom: Spacing[1],
  },
  userSubtitle: {
    fontSize: Typography.sizes.base,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: Spacing[5],
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing[4],
    borderRadius: Radius.xl,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2],
  },
  statValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: '500',
  },
  settingsSection: {
    marginHorizontal: Spacing[4],
    marginTop: Spacing[4],
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[2],
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing[3],
  },
  settingsContent: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
  },
  settingsSubtitle: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  version: {
    textAlign: 'center',
    fontSize: Typography.sizes.xs,
    marginTop: Spacing[6],
    marginBottom: Spacing[4],
  },
});
