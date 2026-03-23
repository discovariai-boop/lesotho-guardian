import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import type { Incident, EmergencyVehicle, TrafficLight } from '@/hooks/useRealTimeRoadData';

const MASERU_CENTER: [number, number] = [-29.3151, 27.4869];

function createDivIcon(color: string, symbol: string) {
  return L.divIcon({
    className: '',
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:12px;color:white;box-shadow:0 0 12px ${color}80;border:2px solid rgba(255,255,255,0.3)">${symbol}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

const incidentIcons: Record<string, L.DivIcon> = {
  crash: createDivIcon('#ef4444', '💥'),
  pothole: createDivIcon('#eab308', '⚠'),
  congestion: createDivIcon('#f97316', '🚗'),
  closure: createDivIcon('#8b5cf6', '🚧'),
  sos: createDivIcon('#ef4444', '🆘'),
};

const vehicleIcons: Record<string, L.DivIcon> = {
  ambulance: createDivIcon('#f97316', '🚑'),
  police: createDivIcon('#3b82f6', '🚔'),
  fire: createDivIcon('#ef4444', '🚒'),
};

const lightIconFn = (phase: string) =>
  createDivIcon(phase === 'green' ? '#22c55e' : phase === 'yellow' ? '#eab308' : '#ef4444', '🚦');

interface Props {
  incidents: Incident[];
  vehicles: EmergencyVehicle[];
  trafficLights: TrafficLight[];
}

export default function SmartLesothoTransportMap({ incidents, vehicles, trafficLights }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const incidentMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const vehicleMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const lightMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const circlesRef = useRef<Map<string, L.Circle>>(new Map());

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: MASERU_CENTER,
      zoom: 10,
      zoomControl: false,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CARTO',
    }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update incident markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const activeIds = new Set<string>();

    incidents.filter(i => i.status !== 'resolved').forEach(inc => {
      activeIds.add(inc.id);
      const existing = incidentMarkersRef.current.get(inc.id);
      if (existing) {
        existing.setLatLng([inc.lat, inc.lng]);
      } else {
        const m = L.marker([inc.lat, inc.lng], { icon: incidentIcons[inc.type] })
          .bindPopup(`<div style="color:#0a0f1a;font-size:12px"><b>${inc.id}</b> — ${inc.type.toUpperCase()}<br/>${inc.location}<br/>Severity: <b>${inc.severity}</b>${inc.assignedUnit ? `<br/>Unit: ${inc.assignedUnit}` : ''}${inc.eta ? `<br/>ETA: ${inc.eta} min` : ''}</div>`)
          .addTo(map);
        incidentMarkersRef.current.set(inc.id, m);
      }
    });

    // Remove stale
    incidentMarkersRef.current.forEach((m, id) => {
      if (!activeIds.has(id)) { map.removeLayer(m); incidentMarkersRef.current.delete(id); }
    });

    // Critical circles
    const criticalIds = new Set<string>();
    incidents.filter(i => i.severity === 'critical' && i.status === 'active').forEach(inc => {
      criticalIds.add(inc.id);
      if (!circlesRef.current.has(inc.id)) {
        const c = L.circle([inc.lat, inc.lng], { radius: 800, color: '#ef4444', fillColor: '#ef444440', fillOpacity: 0.2, weight: 1 }).addTo(map);
        circlesRef.current.set(inc.id, c);
      }
    });
    circlesRef.current.forEach((c, id) => {
      if (!criticalIds.has(id)) { map.removeLayer(c); circlesRef.current.delete(id); }
    });
  }, [incidents]);

  // Update vehicle markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    vehicles.forEach(v => {
      const existing = vehicleMarkersRef.current.get(v.id);
      if (existing) {
        existing.setLatLng([v.lat, v.lng]);
      } else {
        const m = L.marker([v.lat, v.lng], { icon: vehicleIcons[v.type] })
          .bindPopup(`<div style="color:#0a0f1a;font-size:12px"><b>${v.callsign}</b><br/>Status: ${v.status}<br/>Speed: ${v.speed}km/h</div>`)
          .addTo(map);
        vehicleMarkersRef.current.set(v.id, m);
      }
    });
  }, [vehicles]);

  // Update traffic light markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    trafficLights.forEach(tl => {
      const existing = lightMarkersRef.current.get(tl.id);
      if (existing) {
        existing.setLatLng([tl.lat, tl.lng]).setIcon(lightIconFn(tl.phase));
      } else {
        const m = L.marker([tl.lat, tl.lng], { icon: lightIconFn(tl.phase) })
          .bindPopup(`<div style="color:#0a0f1a;font-size:12px"><b>${tl.intersection}</b><br/>Phase: ${tl.phase} | Mode: ${tl.mode}<br/>Timer: ${tl.timing}s | Power: ${tl.powered ? '✅' : '❌'}</div>`)
          .addTo(map);
        lightMarkersRef.current.set(tl.id, m);
      }
    });
  }, [trafficLights]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="glass-panel overflow-hidden relative h-full"
    >
      <div className="absolute top-3 left-3 z-[1000] glass-panel-sm px-3 py-1.5 flex items-center gap-2">
        <Layers className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-medium text-foreground">National Transport Map</span>
        <span className="w-1.5 h-1.5 bg-transport-green rounded-full status-pulse" />
      </div>
      <div ref={containerRef} className="h-full w-full rounded-[22px]" style={{ background: '#0a0f1a' }} />
    </motion.div>
  );
}
