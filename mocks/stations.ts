import { FuelStation, FuelType, QueueLevel, QueueTrend } from "@/types";

export const MOCK_STATIONS: FuelStation[] = [
  {
    id: "1",
    name: "TotalEnergies Meskel Square",
    brand: "TotalEnergies",
    latitude: 9.0107,
    longitude: 38.7613,
    address: "Meskel Square, Addis Ababa",
    city: "Addis Ababa",
    phone: "+251 11 551 2111",
    operatingHours: "24 hours",
    fuelTypes: ['petrol', 'diesel'],
    currentStatus: {
      fuelAvailable: 'both',
      queueLevel: 'medium',
      confidence: 0.85,
      lastUpdated: new Date(Date.now() - 15 * 60000),
      trend: 'increasing',
    },
    reports: [],
    insights: {
      bestTimeToVisit: "Early morning (6-8 AM)",
      averageWaitTime: 45,
      peakHours: ["7:00-9:00", "17:00-19:00"],
    },
  },
  {
    id: "2",
    name: "Oilibya Bole Road",
    brand: "Oilibya",
    latitude: 9.0100,
    longitude: 38.7800,
    address: "Bole Road, Addis Ababa",
    city: "Addis Ababa",
    operatingHours: "6:00 AM - 10:00 PM",
    fuelTypes: ['petrol', 'diesel'],
    currentStatus: {
      fuelAvailable: 'petrol',
      queueLevel: 'short',
      confidence: 0.72,
      lastUpdated: new Date(Date.now() - 45 * 60000),
      trend: 'stable',
    },
    reports: [],
    insights: {
      bestTimeToVisit: "Afternoon (2-4 PM)",
      averageWaitTime: 15,
      peakHours: ["7:00-9:00", "18:00-20:00"],
    },
  },
  {
    id: "3",
    name: "Shell Piassa",
    brand: "Shell",
    latitude: 9.0300,
    longitude: 38.7500,
    address: "Piassa, Addis Ababa",
    city: "Addis Ababa",
    phone: "+251 11 111 2222",
    operatingHours: "24 hours",
    fuelTypes: ['petrol', 'diesel'],
    currentStatus: {
      fuelAvailable: 'none',
      queueLevel: 'none',
      confidence: 0.91,
      lastUpdated: new Date(Date.now() - 5 * 60000),
      trend: 'stable',
    },
    reports: [],
    insights: {
      bestTimeToVisit: "Morning (6-8 AM)",
      averageWaitTime: 0,
      peakHours: ["8:00-10:00", "17:00-19:00"],
    },
  },
  {
    id: "4",
    name: "TotalEnergies Kazanchis",
    brand: "TotalEnergies",
    latitude: 9.0150,
    longitude: 38.7550,
    address: "Kazanchis, Addis Ababa",
    city: "Addis Ababa",
    operatingHours: "24 hours",
    fuelTypes: ['petrol', 'diesel'],
    currentStatus: {
      fuelAvailable: 'both',
      queueLevel: 'long',
      confidence: 0.88,
      lastUpdated: new Date(Date.now() - 10 * 60000),
      trend: 'increasing',
    },
    reports: [],
    insights: {
      bestTimeToVisit: "Late night (10 PM - 6 AM)",
      averageWaitTime: 120,
      peakHours: ["6:00-9:00", "17:00-20:00"],
    },
  },
  {
    id: "5",
    name: "National Oil Bole Medhanialem",
    brand: "National Oil",
    latitude: 9.0050,
    longitude: 38.7850,
    address: "Bole Medhanialem, Addis Ababa",
    city: "Addis Ababa",
    operatingHours: "6:00 AM - 11:00 PM",
    fuelTypes: ['petrol', 'diesel'],
    currentStatus: {
      fuelAvailable: 'diesel',
      queueLevel: 'short',
      confidence: 0.65,
      lastUpdated: new Date(Date.now() - 90 * 60000),
      trend: 'decreasing',
    },
    reports: [],
    insights: {
      bestTimeToVisit: "Midday (11 AM - 2 PM)",
      averageWaitTime: 20,
      peakHours: ["7:00-9:00", "18:00-20:00"],
    },
  },
  {
    id: "6",
    name: "Oilibya CMC",
    brand: "Oilibya",
    latitude: 9.0200,
    longitude: 38.7700,
    address: "CMC Road, Addis Ababa",
    city: "Addis Ababa",
    operatingHours: "24 hours",
    fuelTypes: ['petrol', 'diesel'],
    currentStatus: {
      fuelAvailable: 'both',
      queueLevel: 'none',
      confidence: 0.78,
      lastUpdated: new Date(Date.now() - 30 * 60000),
      trend: 'stable',
    },
    reports: [],
    insights: {
      bestTimeToVisit: "Anytime",
      averageWaitTime: 5,
      peakHours: ["8:00-9:00"],
    },
  },
  {
    id: "7",
    name: "TotalEnergies Sarbet",
    brand: "TotalEnergies",
    latitude: 9.0000,
    longitude: 38.7400,
    address: "Sarbet, Addis Ababa",
    city: "Addis Ababa",
    operatingHours: "24 hours",
    fuelTypes: ['petrol', 'diesel'],
    currentStatus: {
      fuelAvailable: 'unknown',
      queueLevel: 'unknown',
      confidence: 0.3,
      lastUpdated: new Date(Date.now() - 180 * 60000),
      trend: 'stable',
    },
    reports: [],
    insights: {
      bestTimeToVisit: "Unknown",
      averageWaitTime: 0,
      peakHours: [],
    },
  },
  {
    id: "8",
    name: "Shell Megenagna",
    brand: "Shell",
    latitude: 9.0350,
    longitude: 38.7650,
    address: "Megenagna, Addis Ababa",
    city: "Addis Ababa",
    operatingHours: "24 hours",
    fuelTypes: ['petrol', 'diesel'],
    currentStatus: {
      fuelAvailable: 'both',
      queueLevel: 'medium',
      confidence: 0.82,
      lastUpdated: new Date(Date.now() - 20 * 60000),
      trend: 'decreasing',
    },
    reports: [],
    insights: {
      bestTimeToVisit: "Late evening (8-10 PM)",
      averageWaitTime: 35,
      peakHours: ["7:00-9:00", "17:00-19:00"],
    },
  },
  {
    id: "9",
    name: "National Oil Ayat",
    brand: "National Oil",
    latitude: 9.0500,
    longitude: 38.7900,
    address: "Ayat, Addis Ababa",
    city: "Addis Ababa",
    operatingHours: "6:00 AM - 10:00 PM",
    fuelTypes: ['petrol', 'diesel'],
    currentStatus: {
      fuelAvailable: 'petrol',
      queueLevel: 'short',
      confidence: 0.70,
      lastUpdated: new Date(Date.now() - 60 * 60000),
      trend: 'stable',
    },
    reports: [],
    insights: {
      bestTimeToVisit: "Morning (7-9 AM)",
      averageWaitTime: 10,
      peakHours: ["8:00-10:00"],
    },
  },
  {
    id: "10",
    name: "Oilibya Lafto",
    brand: "Oilibya",
    latitude: 8.9800,
    longitude: 38.7500,
    address: "Lafto, Addis Ababa",
    city: "Addis Ababa",
    operatingHours: "24 hours",
    fuelTypes: ['petrol', 'diesel'],
    currentStatus: {
      fuelAvailable: 'both',
      queueLevel: 'long',
      confidence: 0.75,
      lastUpdated: new Date(Date.now() - 8 * 60000),
      trend: 'increasing',
    },
    reports: [],
    insights: {
      bestTimeToVisit: "Very early (5-7 AM)",
      averageWaitTime: 90,
      peakHours: ["6:00-10:00", "17:00-20:00"],
    },
  },
];

export const getStationById = (id: string): FuelStation | undefined => {
  return MOCK_STATIONS.find(station => station.id === id);
};

export const getNearbyStations = (
  lat: number,
  lng: number,
  radiusKm: number = 5
): FuelStation[] => {
  return MOCK_STATIONS.filter(station => {
    const distance = calculateDistance(lat, lng, station.latitude, station.longitude);
    return distance <= radiusKm;
  });
};

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const getQueueLevelText = (level: QueueLevel): string => {
  switch (level) {
    case 'none': return 'No Queue';
    case 'short': return 'Short Queue';
    case 'medium': return 'Medium Queue';
    case 'long': return 'Long Queue';
    default: return 'Unknown';
  }
};

export const getFuelStatusText = (status: FuelType): string => {
  switch (status) {
    case 'petrol': return 'Petrol Only';
    case 'diesel': return 'Diesel Only';
    case 'both': return 'Fuel Available';
    case 'none': return 'No Fuel';
    default: return 'Unknown';
  }
};

export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day ago`;
};
