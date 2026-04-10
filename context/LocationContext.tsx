import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { LocationData, MovementPattern, FuelStation } from '@/types';
import { MOCK_STATIONS } from '@/mocks/stations';

interface QueueDetectionState {
  isInQueue: boolean;
  confidence: number;
  stationId: string | null;
  dwellTime: number;
}

interface LocationContextState {
  location: LocationData | null;
  isTracking: boolean;
  error: string | null;
  movementPattern: MovementPattern;
  queueDetection: QueueDetectionState;
  requestPermission: () => Promise<boolean>;
  startTracking: () => void;
  stopTracking: () => void;
}

const MOVEMENT_THRESHOLD = {
  stationary: 0.5,
  slow: 2,
};

const QUEUE_DETECTION_CONFIG = {
  geofenceRadius: 100,
  minDwellTime: 5 * 60 * 1000,
  maxDwellTime: 30 * 60 * 1000,
  sampleInterval: 5000,
};

export const [LocationProvider, useLocation] = createContextHook<LocationContextState>(() => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [movementPattern, setMovementPattern] = useState<MovementPattern>({
    type: 'moving',
    speed: 0,
    duration: 0,
    confidence: 0,
  });
  const [queueDetection, setQueueDetection] = useState<QueueDetectionState>({
    isInQueue: false,
    confidence: 0,
    stationId: null,
    dwellTime: 0,
  });

  const locationHistory = useRef<LocationData[]>([]);
  const trackingInterval = useRef<NodeJS.Timeout | null>(null);
  const dwellStartTime = useRef<number | null>(null);
  const currentStation = useRef<FuelStation | null>(null);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        setError('Location permission denied');
        return false;
      }
      return true;
    } catch (err) {
      setError('Failed to request location permission');
      return false;
    }
  }, []);

  const getCurrentPosition = useCallback(async () => {
    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy || 0,
        speed: position.coords.speed || 0,
        timestamp: position.timestamp,
      };
    } catch (err) {
      return null;
    }
  }, []);

  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const analyzeMovementPattern = useCallback((history: LocationData[]): MovementPattern => {
    if (history.length < 2) {
      return { type: 'moving', speed: 0, duration: 0, confidence: 0 };
    }

    const recent = history.slice(-6);
    const speeds = recent.map(loc => loc.speed);
    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    const maxSpeed = Math.max(...speeds);

    const now = Date.now();
    const firstTimestamp = recent[0]?.timestamp || now;
    const duration = now - firstTimestamp;

    let type: MovementPattern['type'] = 'moving';
    if (avgSpeed < MOVEMENT_THRESHOLD.stationary) {
      type = 'stationary';
    } else if (avgSpeed < MOVEMENT_THRESHOLD.slow) {
      type = 'slow';
    } else if (maxSpeed > MOVEMENT_THRESHOLD.slow && avgSpeed < MOVEMENT_THRESHOLD.slow) {
      type = 'intermittent';
    }

    const speedVariance = speeds.reduce((sum, s) => sum + Math.pow(s - avgSpeed, 2), 0) / speeds.length;
    const confidence = Math.min(1, Math.max(0.3, 1 - speedVariance / 10));

    return { type, speed: avgSpeed, duration, confidence };
  }, []);

  const detectQueue = useCallback(() => {
    if (!location) return;

    const nearbyStation = MOCK_STATIONS.find(station => {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        station.latitude,
        station.longitude
      );
      return distance <= QUEUE_DETECTION_CONFIG.geofenceRadius;
    });

    if (!nearbyStation) {
      if (currentStation.current) {
        currentStation.current = null;
        dwellStartTime.current = null;
        setQueueDetection({
          isInQueue: false,
          confidence: 0,
          stationId: null,
          dwellTime: 0,
        });
      }
      return;
    }

    if (currentStation.current?.id !== nearbyStation.id) {
      currentStation.current = nearbyStation;
      dwellStartTime.current = Date.now();
    }

    const pattern = analyzeMovementPattern(locationHistory.current);
    setMovementPattern(pattern);

    const dwellTime = dwellStartTime.current ? Date.now() - dwellStartTime.current : 0;

    if (
      dwellTime >= QUEUE_DETECTION_CONFIG.minDwellTime &&
      (pattern.type === 'stationary' || pattern.type === 'slow' || pattern.type === 'intermittent')
    ) {
      const confidence = Math.min(1, pattern.confidence * (dwellTime / QUEUE_DETECTION_CONFIG.minDwellTime));
      setQueueDetection({
        isInQueue: true,
        confidence,
        stationId: nearbyStation.id,
        dwellTime,
      });
    } else {
      setQueueDetection(prev => ({
        ...prev,
        dwellTime,
        isInQueue: prev.isInQueue && dwellTime < QUEUE_DETECTION_CONFIG.maxDwellTime,
      }));
    }
  }, [location, calculateDistance, analyzeMovementPattern]);

  const trackLocation = useCallback(async () => {
    const position = await getCurrentPosition();
    if (position) {
      setLocation(position);
      locationHistory.current = [...locationHistory.current.slice(-20), position];
      detectQueue();
    }
  }, [getCurrentPosition, detectQueue]);

  const startTracking = useCallback(async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    setIsTracking(true);
    trackLocation();
    trackingInterval.current = setInterval(trackLocation, QUEUE_DETECTION_CONFIG.sampleInterval);
  }, [requestPermission, trackLocation]);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
    if (trackingInterval.current) {
      clearInterval(trackingInterval.current);
      trackingInterval.current = null;
    }
  }, []);

  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, []);

  return {
    location,
    isTracking,
    error,
    movementPattern,
    queueDetection,
    requestPermission,
    startTracking,
    stopTracking,
  };
});
