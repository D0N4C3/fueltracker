export type FuelType = 'petrol' | 'diesel' | 'both' | 'none';

export type QueueLevel = 'none' | 'short' | 'medium' | 'long';

export type QueueTrend = 'increasing' | 'decreasing' | 'stable';

export interface FuelStation {
  id: string;
  name: string;
  brand: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  phone?: string;
  operatingHours: string;
  fuelTypes: FuelType[];
  currentStatus: {
    fuelAvailable: FuelType;
    queueLevel: QueueLevel;
    confidence: number;
    lastUpdated: Date;
    trend: QueueTrend;
  };
  reports: Report[];
  insights: {
    bestTimeToVisit: string;
    averageWaitTime: number;
    peakHours: string[];
  };
}

export interface Report {
  id: string;
  stationId: string;
  fuelStatus: FuelType;
  queueLevel: QueueLevel;
  timestamp: Date;
  confidence: number;
  userId?: string;
  isPassive: boolean;
}

export interface PassiveSignal {
  stationId: string;
  userId: string;
  dwellTime: number;
  movementPattern: 'stationary' | 'slow' | 'intermittent';
  timestamp: Date;
  confidence: number;
}

export interface UserProfile {
  id: string;
  name?: string;
  anonymous: boolean;
  contributions: {
    reports: number;
    passiveSignals: number;
    helpfulVotes: number;
  };
  preferences: {
    notifications: boolean;
    smartDetection: boolean;
    radiusKm: number;
  };
}

export interface Notification {
  id: string;
  type: 'fuel_available' | 'queue_dropped' | 'station_nearby';
  title: string;
  message: string;
  stationId: string;
  timestamp: Date;
  read: boolean;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number;
  timestamp: number;
}

export interface MovementPattern {
  type: 'stationary' | 'slow' | 'intermittent' | 'moving';
  speed: number;
  duration: number;
  confidence: number;
}
