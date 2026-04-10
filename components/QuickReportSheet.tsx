import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { X, Fuel, Zap, AlertCircle, CheckCircle2, Clock, Timer } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useFuel } from '@/context/FuelContext';
import { FuelStation, QueueLevel, FuelType } from '@/types';
import { Radius, Shadows, Spacing, Typography, Colors } from '@/constants/design';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface QuickReportSheetProps {
  visible: boolean;
  onClose: () => void;
  station?: FuelStation;
}

type Step = 'fuel' | 'queue' | 'success';

export const QuickReportSheet: React.FC<QuickReportSheetProps> = ({
  visible,
  onClose,
  station,
}) => {
  const { theme, isDark } = useTheme();
  const { addReport } = useFuel();
  
  const [step, setStep] = useState<Step>('fuel');
  const [selectedFuel, setSelectedFuel] = useState<FuelType | null>(null);
  const [selectedQueue, setSelectedQueue] = useState<QueueLevel | null>(null);
  
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setStep('fuel');
      setSelectedFuel(null);
      setSelectedQueue(null);
      
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 80,
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
          toValue: SCREEN_HEIGHT,
          useNativeDriver: true,
          friction: 8,
          tension: 80,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleFuelSelect = useCallback((fuel: FuelType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFuel(fuel);
    setTimeout(() => setStep('queue'), 200);
  }, []);

  const handleQueueSelect = useCallback((queue: QueueLevel) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedQueue(queue);
    
    // Submit report
    if (station && selectedFuel) {
      addReport(station.id, {
        stationId: station.id,
        fuelStatus: selectedFuel,
        queueLevel: queue,
        confidence: 0.9,
        isPassive: false,
      });
      
      setTimeout(() => setStep('success'), 300);
      setTimeout(() => onClose(), 2000);
    }
  }, [station, selectedFuel, addReport, onClose]);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }, [onClose]);

  if (!visible) return null;

  const fuelOptions: { type: FuelType; label: string; icon: React.ReactNode; color: string }[] = [
    { 
      type: 'both', 
      label: 'Both Available', 
      icon: <Zap size={24} color="#fff" />,
      color: Colors.fuel.both,
    },
    { 
      type: 'petrol', 
      label: 'Petrol Only', 
      icon: <Fuel size={24} color="#fff" />,
      color: Colors.fuel.petrol,
    },
    { 
      type: 'diesel', 
      label: 'Diesel Only', 
      icon: <Fuel size={24} color="#fff" />,
      color: Colors.fuel.diesel,
    },
    { 
      type: 'none', 
      label: 'No Fuel', 
      icon: <AlertCircle size={24} color="#fff" />,
      color: Colors.fuel.none,
    },
  ];

  const queueOptions: { level: QueueLevel; label: string; icon: React.ReactNode; color: string; time: string }[] = [
    { 
      level: 'none', 
      label: 'No Queue', 
      icon: <CheckCircle2 size={24} color="#fff" />,
      color: Colors.queue.none,
      time: '0-5 min',
    },
    { 
      level: 'short', 
      label: 'Short Queue', 
      icon: <Timer size={24} color="#fff" />,
      color: Colors.queue.short,
      time: '10-20 min',
    },
    { 
      level: 'medium', 
      label: 'Medium Queue', 
      icon: <Clock size={24} color="#fff" />,
      color: Colors.queue.medium,
      time: '30-60 min',
    },
    { 
      level: 'long', 
      label: 'Long Queue', 
      icon: <Clock size={24} color="#fff" />,
      color: Colors.queue.long,
      time: '60+ min',
    },
  ];

  return (
    <Animated.View
      style={[
        styles.overlay,
        { opacity: fadeAnim },
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <TouchableOpacity
        style={styles.backdrop}
        onPress={handleClose}
        activeOpacity={1}
      />
      
      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: theme.surface,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Handle */}
        <View style={styles.handleBar}>
          <View style={[styles.handle, { backgroundColor: isDark ? '#475569' : '#cbd5e1' }]} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.text.primary }]}>
              {step === 'fuel' && 'What fuel is available?'}
              {step === 'queue' && 'How long is the queue?'}
              {step === 'success' && 'Thank you!'}
            </Text>
            {station && (
              <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
                {station.name}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
            onPress={handleClose}
          >
            <X size={20} color={theme.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {step === 'fuel' && (
            <View style={styles.optionsGrid}>
              {fuelOptions.map((option) => (
                <TouchableOpacity
                  key={option.type}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                      borderColor: selectedFuel === option.type ? option.color : 'transparent',
                    },
                  ]}
                  onPress={() => handleFuelSelect(option.type)}
                >
                  <View style={[styles.optionIcon, { backgroundColor: option.color }]}>
                    {option.icon}
                  </View>
                  <Text style={[styles.optionLabel, { color: theme.text.primary }]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {step === 'queue' && (
            <View style={styles.optionsGrid}>
              {queueOptions.map((option) => (
                <TouchableOpacity
                  key={option.level}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                      borderColor: selectedQueue === option.level ? option.color : 'transparent',
                    },
                  ]}
                  onPress={() => handleQueueSelect(option.level)}
                >
                  <View style={[styles.optionIcon, { backgroundColor: option.color }]}>
                    {option.icon}
                  </View>
                  <Text style={[styles.optionLabel, { color: theme.text.primary }]}>
                    {option.label}
                  </Text>
                  <View style={[styles.timeBadge, { backgroundColor: `${option.color}20` }]}>
                    <Text style={[styles.timeText, { color: option.color }]}>
                      {option.time}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {step === 'success' && (
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <CheckCircle2 size={48} color="#fff" />
              </View>
              <Text style={[styles.successTitle, { color: theme.text.primary }]}>
                Report Submitted!
              </Text>
              <Text style={[styles.successText, { color: theme.text.secondary }]}>
                Your update helps the community find fuel faster.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Progress indicator */}
        {step !== 'success' && (
          <View style={styles.progressContainer}>
            <View style={styles.progressDots}>
              <View style={[styles.dot, { backgroundColor: theme.accent }]} />
              <View style={[styles.dot, { backgroundColor: step === 'queue' || step === 'success' ? theme.accent : theme.border }]} />
            </View>
            <Text style={[styles.progressText, { color: theme.text.tertiary }]}>
              Step {step === 'fuel' ? 1 : 2} of 2
            </Text>
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    maxHeight: SCREEN_HEIGHT * 0.7,
    ...Shadows['2xl'],
  },
  handleBar: {
    alignItems: 'center',
    paddingVertical: Spacing[3],
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[4],
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[6],
  },
  optionsGrid: {
    gap: Spacing[3],
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
    padding: Spacing[4],
    borderRadius: Radius.xl,
    borderWidth: 2,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  optionLabel: {
    flex: 1,
    fontSize: Typography.sizes.lg,
    fontWeight: '600',
  },
  timeBadge: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: Radius.full,
  },
  timeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: Spacing[10],
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.success.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[5],
    ...Shadows.lg,
  },
  successTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: '700',
    marginBottom: Spacing[2],
  },
  successText: {
    fontSize: Typography.sizes.base,
    textAlign: 'center',
    paddingHorizontal: Spacing[6],
  },
  progressContainer: {
    alignItems: 'center',
    paddingVertical: Spacing[5],
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  progressDots: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginBottom: Spacing[2],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '500',
  },
});
