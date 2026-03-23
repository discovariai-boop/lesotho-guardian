import { useState, useEffect, useCallback } from 'react';

export interface Incident {
  id: string;
  type: 'crash' | 'pothole' | 'congestion' | 'closure' | 'sos';
  severity: 'critical' | 'high' | 'medium' | 'low';
  location: string;
  lat: number;
  lng: number;
  timestamp: Date;
  status: 'active' | 'responding' | 'resolved';
  assignedUnit?: string;
  eta?: number;
  description: string;
}

export interface EmergencyVehicle {
  id: string;
  type: 'ambulance' | 'police' | 'fire';
  callsign: string;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  status: 'available' | 'dispatched' | 'en-route' | 'on-scene';
  destination?: string;
  eta?: number;
}

export interface TrafficLight {
  id: string;
  intersection: string;
  lat: number;
  lng: number;
  phase: 'green' | 'yellow' | 'red';
  mode: 'auto' | 'manual' | 'emergency';
  timing: number;
  powered: boolean;
}

export interface RoadSegment {
  id: string;
  name: string;
  potholes: number;
  severity: 'good' | 'fair' | 'poor' | 'critical';
  trafficVolume: number;
  historicalAvg: number;
  sensorStatus: 'online' | 'offline';
  lastReading: Date;
  maintenanceStatus: 'none' | 'scheduled' | 'in-progress';
}

export interface DashboardStats {
  activeIncidents: number;
  respondingUnits: number;
  avgResponseTime: number;
  trafficFlow: number;
  sensorUptime: number;
  lightsOnline: number;
}

const DISTRICTS = ['Maseru', 'Leribe', 'Berea', 'Mafeteng', 'Mohale\'s Hoek', 'Quthing', 'Qacha\'s Nek', 'Mokhotlong', 'Thaba-Tseka', 'Butha-Buthe'];
const ROADS = ['A1 Main South', 'A2 Main North', 'A3 Mountain Road', 'B20 Maseru Bypass', 'A5 Eastern Route'];

function randomFrom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function generateIncidents(): Incident[] {
  const types: Incident['type'][] = ['crash', 'pothole', 'congestion', 'closure', 'sos'];
  const severities: Incident['severity'][] = ['critical', 'high', 'medium', 'low'];
  const statuses: Incident['status'][] = ['active', 'responding', 'resolved'];
  return Array.from({ length: 12 }, (_, i) => ({
    id: `INC-${1000 + i}`,
    type: randomFrom(types),
    severity: randomFrom(severities),
    location: `${randomFrom(ROADS)}, ${randomFrom(DISTRICTS)}`,
    lat: -29.3 + Math.random() * 0.4,
    lng: 27.4 + Math.random() * 0.8,
    timestamp: new Date(Date.now() - Math.random() * 7200000),
    status: randomFrom(statuses),
    assignedUnit: Math.random() > 0.3 ? `Unit-${Math.floor(Math.random() * 20) + 1}` : undefined,
    eta: Math.random() > 0.4 ? Math.floor(Math.random() * 25) + 2 : undefined,
    description: `${randomFrom(types)} reported near km ${Math.floor(Math.random() * 100)}`,
  }));
}

function generateVehicles(): EmergencyVehicle[] {
  const types: EmergencyVehicle['type'][] = ['ambulance', 'police', 'fire'];
  const statuses: EmergencyVehicle['status'][] = ['available', 'dispatched', 'en-route', 'on-scene'];
  return Array.from({ length: 8 }, (_, i) => ({
    id: `VEH-${i}`,
    type: randomFrom(types),
    callsign: `${randomFrom(types).substring(0, 3).toUpperCase()}-${100 + i}`,
    lat: -29.31 + Math.random() * 0.1,
    lng: 27.48 + Math.random() * 0.1,
    heading: Math.random() * 360,
    speed: Math.floor(Math.random() * 80) + 20,
    status: randomFrom(statuses),
    eta: Math.floor(Math.random() * 15) + 1,
  }));
}

function generateLights(): TrafficLight[] {
  const phases: TrafficLight['phase'][] = ['green', 'yellow', 'red'];
  const intersections = ['Kingsway/Pioneer Mall', 'Main South/Moshoeshoe', 'Cathedral Circle', 'Maseru Bridge Junction', 'Stadium Roundabout', 'LNDC Intersection'];
  return intersections.map((name, i) => ({
    id: `TL-${i}`,
    intersection: name,
    lat: -29.31 + (i * 0.005),
    lng: 27.48 + (i * 0.003),
    phase: randomFrom(phases),
    mode: Math.random() > 0.8 ? 'manual' : 'auto',
    timing: Math.floor(Math.random() * 45) + 15,
    powered: Math.random() > 0.05,
  }));
}

function generateRoads(): RoadSegment[] {
  const sevs: RoadSegment['severity'][] = ['good', 'fair', 'poor', 'critical'];
  return ROADS.map((name, i) => ({
    id: `RD-${i}`,
    name,
    potholes: Math.floor(Math.random() * 30),
    severity: randomFrom(sevs),
    trafficVolume: Math.floor(Math.random() * 2000) + 500,
    historicalAvg: Math.floor(Math.random() * 1800) + 600,
    sensorStatus: Math.random() > 0.15 ? 'online' : 'offline',
    lastReading: new Date(Date.now() - Math.random() * 3600000),
    maintenanceStatus: Math.random() > 0.7 ? 'scheduled' : 'none',
  }));
}

export function useRealTimeRoadData() {
  const [incidents, setIncidents] = useState<Incident[]>(generateIncidents);
  const [vehicles, setVehicles] = useState<EmergencyVehicle[]>(generateVehicles);
  const [trafficLights, setTrafficLights] = useState<TrafficLight[]>(generateLights);
  const [roads, setRoads] = useState<RoadSegment[]>(generateRoads);
  const [stats, setStats] = useState<DashboardStats>({
    activeIncidents: 7, respondingUnits: 5, avgResponseTime: 8.4,
    trafficFlow: 78, sensorUptime: 94.2, lightsOnline: 98,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(v => ({
        ...v,
        lat: v.lat + (Math.random() - 0.5) * 0.002,
        lng: v.lng + (Math.random() - 0.5) * 0.002,
        speed: Math.max(0, v.speed + (Math.random() - 0.5) * 10),
      })));
      setTrafficLights(prev => prev.map(l => ({
        ...l,
        phase: Math.random() > 0.7 ? randomFrom(['green', 'yellow', 'red'] as TrafficLight['phase'][]) : l.phase,
        timing: Math.max(5, l.timing + Math.floor((Math.random() - 0.5) * 4)),
      })));
      setStats(prev => ({
        ...prev,
        activeIncidents: Math.max(1, prev.activeIncidents + Math.floor((Math.random() - 0.4) * 2)),
        trafficFlow: Math.min(100, Math.max(40, prev.trafficFlow + (Math.random() - 0.5) * 5)),
        avgResponseTime: Math.max(3, +(prev.avgResponseTime + (Math.random() - 0.5) * 0.5).toFixed(1)),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const overrideLight = useCallback((id: string, phase: TrafficLight['phase']) => {
    setTrafficLights(prev => prev.map(l => l.id === id ? { ...l, phase, mode: 'manual' } : l));
  }, []);

  const activateGreenWave = useCallback(() => {
    setTrafficLights(prev => prev.map(l => ({ ...l, phase: 'green', mode: 'emergency' })));
    setTimeout(() => {
      setTrafficLights(prev => prev.map(l => ({ ...l, mode: 'auto' })));
    }, 15000);
  }, []);

  return { incidents, vehicles, trafficLights, roads, stats, overrideLight, activateGreenWave };
}
