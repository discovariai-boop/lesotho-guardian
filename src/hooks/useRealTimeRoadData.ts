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
  reportedBy: string;
  affectedLanes: number;
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
  mode: 'auto' | 'manual' | 'emergency' | 'off';
  timing: number;
  powered: boolean;
  cycleCount: number;
  avgWaitTime: number;
}

export interface RoadSegment {
  id: string;
  name: string;
  condition: 'good' | 'fair' | 'poor' | 'critical';
  healthScore: number;
  potholes: number;
  trafficVolume: number;
  historicalAvg: number;
  sensorStatus: 'online' | 'offline';
  lastReading: Date;
  maintenanceStatus: 'none' | 'scheduled' | 'in-progress';
  length: number;
  congestionLevel: number;
}

export interface DashboardStats {
  activeIncidents: number;
  respondingUnits: number;
  avgResponseTime: number;
  trafficFlow: number;
  sensorUptime: number;
  lightsOnline: number;
  resolvedToday: number;
  totalVehicles: number;
}

function randomFrom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

const MASERU_LOCATIONS = [
  { name: 'Kingsway & Moshoeshoe Rd — Maseru CBD', lat: -29.3151, lng: 27.4869 },
  { name: 'Maseru Bridge Border Post', lat: -29.3104, lng: 27.4744 },
  { name: 'Maqalika Reservoir Access Rd', lat: -29.3420, lng: 27.4520 },
  { name: 'Ha Hoohlo Township', lat: -29.3270, lng: 27.5080 },
  { name: 'Maseru West Industrial Area', lat: -29.3010, lng: 27.4610 },
  { name: 'Lancers Gap Road', lat: -29.3330, lng: 27.5150 },
  { name: 'St. James Hospital Access Road', lat: -29.2950, lng: 27.4990 },
  { name: 'Moshoeshoe I Airport Road', lat: -29.4620, lng: 27.5500 },
  { name: 'Leribe Highway A1', lat: -29.0060, lng: 28.0360 },
  { name: 'Mafeteng District Road', lat: -29.8200, lng: 27.2400 },
  { name: 'Thaba-Tseka Mountain Pass', lat: -29.5200, lng: 28.6100 },
  { name: 'Teyateyaneng City Centre', lat: -29.1500, lng: 27.7200 },
];

function generateIncidents(): Incident[] {
  const types: Incident['type'][] = ['crash', 'pothole', 'congestion', 'closure', 'sos'];
  const severities: Incident['severity'][] = ['critical', 'high', 'medium', 'low'];
  const statuses: Incident['status'][] = ['active', 'responding', 'resolved'];
  const units = ['AMB-03', 'AMB-07', 'POL-04', 'POL-12', 'FIRE-05', 'UNIT-09'];
  const reporters = ['Citizen App', 'Road Sensor', 'CCTV-AI', 'Officer Report', 'Emergency Call'];
  const descriptions: Record<Incident['type'], string> = {
    crash: 'Multi-vehicle collision blocking lanes',
    pothole: 'Deep pothole causing vehicle damage',
    congestion: 'Heavy traffic congestion forming',
    closure: 'Road closed due to construction works',
    sos: 'Emergency SOS signal from motorist',
  };

  return Array.from({ length: 12 }, (_, i) => {
    const loc = MASERU_LOCATIONS[i % MASERU_LOCATIONS.length];
    const type = types[i % types.length];
    const status = statuses[i % 3];
    return {
      id: `INC-${String(2400 + i).padStart(4, '0')}`,
      type,
      severity: severities[i % 4],
      location: loc.name,
      lat: loc.lat + (Math.random() - 0.5) * 0.015,
      lng: loc.lng + (Math.random() - 0.5) * 0.015,
      timestamp: new Date(Date.now() - Math.random() * 14400000),
      status,
      assignedUnit: status !== 'active' ? randomFrom(units) : undefined,
      eta: status === 'responding' ? Math.floor(Math.random() * 14) + 2 : undefined,
      description: descriptions[type],
      reportedBy: randomFrom(reporters),
      affectedLanes: Math.floor(Math.random() * 3) + 1,
    };
  });
}

function generateVehicles(): EmergencyVehicle[] {
  return [
    { id: 'v1', type: 'ambulance', callsign: 'AMB-03', lat: -29.3100, lng: 27.4900, speed: 65, status: 'dispatched', heading: 90 },
    { id: 'v2', type: 'police', callsign: 'POL-07', lat: -29.3250, lng: 27.4800, speed: 80, status: 'on-scene', heading: 180 },
    { id: 'v3', type: 'fire', callsign: 'FIRE-02', lat: -29.3050, lng: 27.4960, speed: 0, status: 'available', heading: 0 },
    { id: 'v4', type: 'ambulance', callsign: 'AMB-07', lat: -29.3320, lng: 27.5010, speed: 55, status: 'en-route', heading: 270 },
    { id: 'v5', type: 'police', callsign: 'POL-12', lat: -29.3180, lng: 27.4720, speed: 70, status: 'dispatched', heading: 45 },
  ];
}

function generateLights(): TrafficLight[] {
  const intersections = [
    { name: 'Kingsway & Moshoeshoe Rd', lat: -29.3151, lng: 27.4869 },
    { name: 'Pioneer Rd & Palace Rd', lat: -29.3090, lng: 27.4940 },
    { name: 'Lancers Gap & Cathedral Rd', lat: -29.3280, lng: 27.5100 },
    { name: 'Main South Rd & Tlokoeng', lat: -29.3350, lng: 27.4780 },
    { name: 'Airport Rd Interchange', lat: -29.3420, lng: 27.5050 },
    { name: 'Maseru Bridge Junction', lat: -29.3104, lng: 27.4744 },
    { name: 'Industrial Area North Gate', lat: -29.2980, lng: 27.4640 },
    { name: 'Ha Matala Crossroads', lat: -29.3500, lng: 27.4900 },
  ];
  const phases: TrafficLight['phase'][] = ['green', 'yellow', 'red'];
  return intersections.map((loc, i) => ({
    id: `TL-${String(i + 1).padStart(3, '0')}`,
    intersection: loc.name,
    lat: loc.lat,
    lng: loc.lng,
    phase: randomFrom(phases),
    mode: i === 2 ? 'emergency' : i === 5 ? 'off' : 'auto' as TrafficLight['mode'],
    timing: Math.floor(Math.random() * 45) + 15,
    powered: i !== 5,
    cycleCount: Math.floor(Math.random() * 800) + 200,
    avgWaitTime: Math.round((Math.random() * 40 + 8) * 10) / 10,
  }));
}

function generateRoads(): RoadSegment[] {
  const roads = [
    'Kingsway (A1)', 'Main South Road (A2)', 'Moshoeshoe I Airport Road',
    'Lancers Gap Road', 'Pioneer Road', 'Cathedral Road',
    'Main North Road (A3)', 'Mafeteng Bypass', 'Leribe Highway', 'Thaba-Tseka Pass Road',
  ];
  const conditions: RoadSegment['condition'][] = ['good', 'fair', 'poor', 'critical'];
  return roads.map((name, i) => {
    const condition = conditions[i % 4];
    const healthScore = condition === 'good' ? 75 + Math.floor(Math.random() * 25) :
      condition === 'fair' ? 50 + Math.floor(Math.random() * 25) :
      condition === 'poor' ? 25 + Math.floor(Math.random() * 25) :
      Math.floor(Math.random() * 25);
    return {
      id: `RD-${String(i + 1).padStart(3, '0')}`,
      name,
      condition,
      healthScore,
      potholes: condition === 'critical' ? Math.floor(Math.random() * 20) + 15 :
        condition === 'poor' ? Math.floor(Math.random() * 15) + 5 : Math.floor(Math.random() * 5),
      trafficVolume: Math.floor(Math.random() * 2000) + 500,
      historicalAvg: Math.floor(Math.random() * 1800) + 600,
      sensorStatus: Math.random() > 0.15 ? 'online' : 'offline',
      lastReading: new Date(Date.now() - Math.random() * 3600000),
      maintenanceStatus: Math.random() > 0.7 ? 'scheduled' : Math.random() > 0.85 ? 'in-progress' : 'none',
      length: Math.round(Math.random() * 40 + 5),
      congestionLevel: Math.floor(Math.random() * 100),
    };
  });
}

export function useRealTimeRoadData() {
  const [incidents, setIncidents] = useState<Incident[]>(generateIncidents);
  const [vehicles, setVehicles] = useState<EmergencyVehicle[]>(generateVehicles);
  const [trafficLights, setTrafficLights] = useState<TrafficLight[]>(generateLights);
  const [roads, setRoads] = useState<RoadSegment[]>(generateRoads);
  const [stats, setStats] = useState<DashboardStats>({
    activeIncidents: 7, respondingUnits: 5, avgResponseTime: 8.4,
    trafficFlow: 78, sensorUptime: 94.2, lightsOnline: 87.5,
    resolvedToday: 14, totalVehicles: 5,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(v => ({
        ...v,
        lat: v.lat + (Math.random() - 0.5) * 0.002,
        lng: v.lng + (Math.random() - 0.5) * 0.002,
        speed: Math.max(0, v.speed + (Math.random() - 0.5) * 10),
      })));
      setTrafficLights(prev => prev.map(l => {
        if (!l.powered || l.mode === 'off') return l;
        return {
          ...l,
          phase: Math.random() > 0.75 ? randomFrom(['green', 'yellow', 'red'] as TrafficLight['phase'][]) : l.phase,
          timing: Math.max(5, l.timing + Math.floor((Math.random() - 0.5) * 4)),
          cycleCount: l.cycleCount + (Math.random() > 0.8 ? 1 : 0),
        };
      }));
      setStats(prev => ({
        ...prev,
        activeIncidents: Math.max(1, prev.activeIncidents + Math.floor((Math.random() - 0.4) * 2)),
        trafficFlow: Math.min(100, Math.max(30, prev.trafficFlow + (Math.random() - 0.5) * 5)),
        avgResponseTime: Math.max(3, +(prev.avgResponseTime + (Math.random() - 0.5) * 0.5).toFixed(1)),
        respondingUnits: Math.max(2, Math.min(8, prev.respondingUnits + Math.floor((Math.random() - 0.5) * 2))),
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
      setTrafficLights(prev => prev.map(l => l.mode === 'emergency' ? { ...l, mode: 'auto' } : l));
    }, 15000);
  }, []);

  const resolveIncident = useCallback((id: string) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, status: 'resolved' } : i));
    setStats(prev => ({ ...prev, activeIncidents: Math.max(0, prev.activeIncidents - 1), resolvedToday: prev.resolvedToday + 1 }));
  }, []);

  const dispatchUnit = useCallback((id: string, unit: string) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, status: 'responding', assignedUnit: unit, eta: Math.floor(Math.random() * 12) + 3 } : i));
    setStats(prev => ({ ...prev, respondingUnits: Math.min(8, prev.respondingUnits + 1) }));
  }, []);

  return { incidents, vehicles, trafficLights, roads, stats, overrideLight, activateGreenWave, resolveIncident, dispatchUnit };
}
