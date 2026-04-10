import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { FuelStation, Report, QueueLevel, FuelType, QueueTrend } from '@/types';
import { MOCK_STATIONS, getStationById } from '@/mocks/stations';

interface FuelContextState {
  stations: FuelStation[];
  selectedStation: FuelStation | null;
  isLoading: boolean;
  filter: 'all' | 'available' | 'no-queue' | 'petrol' | 'diesel';
  setSelectedStation: (station: FuelStation | null) => void;
  setFilter: (filter: 'all' | 'available' | 'no-queue' | 'petrol' | 'diesel') => void;
  refreshStations: () => void;
  reportStationStatus: (
    stationId: string,
    fuelStatus: FuelType,
    queueLevel: QueueLevel
  ) => void;
  getStation: (id: string) => FuelStation | undefined;
  addReport: (stationId: string, report: Omit<Report, 'id' | 'timestamp'>) => void;
}

export const [FuelProvider, useFuel] = createContextHook<FuelContextState>(() => {
  const [stations, setStations] = useState<FuelStation[]>(MOCK_STATIONS);
  const [selectedStation, setSelectedStation] = useState<FuelStation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'available' | 'no-queue' | 'petrol' | 'diesel'>('all');

  const refreshStations = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setStations(prev => [...prev]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStation = useCallback((id: string): FuelStation | undefined => {
    return getStationById(id) || stations.find(s => s.id === id);
  }, [stations]);

  const reportStationStatus = useCallback((
    stationId: string,
    fuelStatus: FuelType,
    queueLevel: QueueLevel
  ) => {
    setStations(prev =>
      prev.map(station => {
        if (station.id !== stationId) return station;
        return {
          ...station,
          currentStatus: {
            ...station.currentStatus,
            fuelAvailable: fuelStatus,
            queueLevel: queueLevel,
            lastUpdated: new Date(),
            confidence: 0.95,
          },
        };
      })
    );
  }, []);

  const addReport = useCallback((
    stationId: string,
    reportData: Omit<Report, 'id' | 'timestamp'>
  ) => {
    const newReport: Report = {
      ...reportData,
      id: `report_${Date.now()}`,
      timestamp: new Date(),
    };

    setStations(prev =>
      prev.map(station => {
        if (station.id !== stationId) return station;
        const updatedReports = [newReport, ...station.reports].slice(0, 20);
        return {
          ...station,
          reports: updatedReports,
          currentStatus: {
            fuelAvailable: reportData.fuelStatus,
            queueLevel: reportData.queueLevel,
            confidence: reportData.confidence,
            lastUpdated: new Date(),
            trend: calculateTrend(updatedReports),
          },
        };
      })
    );
  }, []);

  const calculateTrend = (reports: Report[]): QueueTrend => {
    if (reports.length < 2) return 'stable';
    const recent = reports.slice(0, 3);
    const queueOrder = { none: 0, short: 1, medium: 2, long: 3, unknown: 4 };
    const avg = recent.reduce((sum, r) => sum + queueOrder[r.queueLevel], 0) / recent.length;
    const prev = reports.slice(1, 4);
    if (prev.length < 2) return 'stable';
    const prevAvg = prev.reduce((sum, r) => sum + queueOrder[r.queueLevel], 0) / prev.length;
    if (avg > prevAvg) return 'increasing';
    if (avg < prevAvg) return 'decreasing';
    return 'stable';
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setStations(prev => [...prev]);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return {
    stations,
    selectedStation,
    isLoading,
    filter,
    setSelectedStation,
    setFilter,
    refreshStations,
    reportStationStatus,
    getStation,
    addReport,
  };
});
