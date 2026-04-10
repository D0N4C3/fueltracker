import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { MapPin, Clock, Navigation, X, CheckCircle } from 'lucide-react-native';

import { useLocation } from '@/context/LocationContext';
import { useFuel } from '@/context/FuelContext';
import { ThemeColors, QueueColors, FuelColors } from '@/constants/colors';
import { QueueLevel, FuelType } from '@/types';
import { getStationById } from '@/mocks/stations';

const { width } = Dimensions.get('window');

interface QueueDetectionModalProps {
  visible: boolean;
  onClose: () => void;
  stationId: string;
}

export const QueueDetectionModal: React.FC<QueueDetectionModalProps> = ({
  visible,
  onClose,
  stationId,
}) => {
  const { addReport } = useFuel();
  const station = getStationById(stationId);
  
  const [selectedQueue, setSelectedQueue] = useState<QueueLevel | null>(null);
  const [selectedFuel, setSelectedFuel] = useState<FuelType | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(300)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleSubmit = useCallback(() => {
    if (!station || !selectedQueue || !selectedFuel) return;

    addReport(station.id, {
      stationId: station.id,
      fuelStatus: selectedFuel,
      queueLevel: selectedQueue,
      confidence: 0.9,
      isPassive: true,
    });

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedQueue(null);
      setSelectedFuel(null);
      onClose();
    }, 1500);
  }, [station, selectedQueue, selectedFuel, addReport, onClose]);

  const handleDismiss = useCallback(() => {
    setSelectedQueue(null);
    setSelectedFuel(null);
    onClose();
  }, [onClose]);

  if (!visible || !station) return null;

  const queueOptions: { level: QueueLevel; label: string; color: string }[] = [
    { level: 'none', label: 'No Queue', color: QueueColors.none },
    { level: 'short', label: 'Short', color: QueueColors.short },
    { level: 'medium', label: 'Medium', color: QueueColors.medium },
    { level: 'long', label: 'Long', color: QueueColors.long },
  ];

  const fuelOptions: { status: FuelType; label: string; color: string }[] = [
    { status: 'both', label: 'Both', color: FuelColors.both },
    { status: 'petrol', label: 'Petrol', color: FuelColors.petrol },
    { status: 'diesel', label: 'Diesel', color: FuelColors.diesel },
    { status: 'none', label: 'Empty', color: FuelColors.none },
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
        onPress={handleDismiss}
        activeOpacity={1}
      />
      <Animated.View
        style={[
          styles.modal,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {showSuccess ? (
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <CheckCircle size={48} color="white" />
            </View>
            <Text style={styles.successText}>Thank you!</Text>
            <Text style={styles.successSubtext}>Your report helps everyone</Text>
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <MapPin size={24} color={ThemeColors.primary} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.title}>Detected Station</Text>
                <Text style={styles.stationName} numberOfLines={1}>
                  {station.name}
                </Text>
              </View>
              <TouchableOpacity onPress={handleDismiss} style={styles.closeBtn}>
                <X size={20} color={ThemeColors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.detectionInfo}>
              <View style={styles.infoRow}>
                <Navigation size={14} color={ThemeColors.textMuted} />
                <Text style={styles.infoText}>Within 100m of station</Text>
              </View>
              <View style={styles.infoRow}>
                <Clock size={14} color={ThemeColors.textMuted} />
                <Text style={styles.infoText}>Stationary for 5+ minutes</Text>
              </View>
            </View>

            <Text style={styles.sectionLabel}>How's the queue?</Text>
            <View style={styles.optionsRow}>
              {queueOptions.map(option => (
                <TouchableOpacity
                  key={option.level}
                  style={[
                    styles.optionBtn,
                    selectedQueue === option.level && {
                      backgroundColor: option.color,
                      borderColor: option.color,
                    },
                  ]}
                  onPress={() => setSelectedQueue(option.level)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedQueue === option.level && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Fuel available?</Text>
            <View style={styles.optionsRow}>
              {fuelOptions.map(option => (
                <TouchableOpacity
                  key={option.status}
                  style={[
                    styles.optionBtn,
                    selectedFuel === option.status && {
                      backgroundColor: option.color,
                      borderColor: option.color,
                    },
                  ]}
                  onPress={() => setSelectedFuel(option.status)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedFuel === option.status && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.dismissBtn} onPress={handleDismiss}>
                <Text style={styles.dismissText}>Not in queue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  (!selectedQueue || !selectedFuel) && styles.submitBtnDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!selectedQueue || !selectedFuel}
              >
                <Text style={styles.submitText}>Update Status</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: ThemeColors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successText: {
    fontSize: 20,
    fontWeight: '700',
    color: ThemeColors.text,
  },
  successSubtext: {
    fontSize: 14,
    color: ThemeColors.textSecondary,
    marginTop: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: ThemeColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    color: ThemeColors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stationName: {
    fontSize: 16,
    fontWeight: '600',
    color: ThemeColors.text,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ThemeColors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detectionInfo: {
    backgroundColor: ThemeColors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  infoText: {
    fontSize: 13,
    color: ThemeColors.textSecondary,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: ThemeColors.text,
    marginBottom: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  optionBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: ThemeColors.border,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 12,
    fontWeight: '500',
    color: ThemeColors.text,
  },
  optionTextSelected: {
    color: 'white',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  dismissBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: ThemeColors.background,
    alignItems: 'center',
  },
  dismissText: {
    fontSize: 14,
    fontWeight: '600',
    color: ThemeColors.textSecondary,
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: ThemeColors.primary,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: ThemeColors.border,
  },
  submitText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});
