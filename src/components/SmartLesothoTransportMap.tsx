import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { Layers, ZoomIn, ZoomOut } from 'lucide-react';
import type { Incident, EmergencyVehicle, TrafficLight } from '@/hooks/useRealTimeRoadData';

const MASERU_CENTER: [number, number] = [-29.3151, 27.4869];

const createIcon = (color: string, symbol: string) =>
  L.divIcon({
    className: '',
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:12px;color:white;box-shadow:0 0 12px ${color}80;border:2px solid rgba(255,255,255,0.3)">${symbol}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

const incidentIcons: Record<string, L.DivIcon> = {
  crash: createIcon('#ef4444', '💥'),
  pothole: createIcon('#eab308', '⚠'),
  congestion: createIcon('#f97316', '🚗'),
  closure: createIcon('#8b5cf6', '🚧'),
  sos: createIcon('#ef4444', '🆘'),
};

const vehicleIcons: Record<string, L.DivIcon> = {
  ambulance: createIcon('#f97316', '🚑'),
  police: createIcon('#3b82f6', '🚔'),
  fire: createIcon('#ef4444', '🚒'),
};

const lightIcon = (phase: string) =>
  createIcon(phase === 'green' ? '#22c55e' : phase === 'yellow' ? '#eab308' : '#ef4444', '🚦');

function AnimatedMarkers({ vehicles }: { vehicles: EmergencyVehicle[] }) {
  const map = useMap();
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    vehicles.forEach(v => {
      const existing = markersRef.current.get(v.id);
      if (existing) {
        existing.setLatLng([v.lat, v.lng]);
      } else {
        const marker = L.marker([v.lat, v.lng], { icon: vehicleIcons[v.type] })
          .bindPopup(`<b>${v.callsign}</b><br/>Status: ${v.status}<br/>Speed: ${v.speed}km/h`)
          .addTo(map);
        markersRef.current.set(v.id, marker);
      }
    });
    return () => {};
  }, [vehicles, map]);

  return null;
}

interface Props {
  incidents: Incident[];
  vehicles: EmergencyVehicle[];
  trafficLights: TrafficLight[];
}

export default function SmartLesothoTransportMap({ incidents, vehicles, trafficLights }: Props) {
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
      <MapContainer
        center={MASERU_CENTER}
        zoom={10}
        className="h-full w-full rounded-[22px]"
        zoomControl={false}
        style={{ background: '#0a0f1a' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        {incidents.filter(i => i.status !== 'resolved').map(inc => (
          <Marker key={inc.id} position={[inc.lat, inc.lng]} icon={incidentIcons[inc.type]}>
            <Popup>
              <div style={{ color: '#0a0f1a', fontSize: 12 }}>
                <b>{inc.id}</b> — {inc.type.toUpperCase()}<br />
                {inc.location}<br />
                Severity: <b>{inc.severity}</b><br />
                {inc.assignedUnit && <>Unit: {inc.assignedUnit}<br /></>}
                {inc.eta && <>ETA: {inc.eta} min</>}
              </div>
            </Popup>
          </Marker>
        ))}
        {trafficLights.map(tl => (
          <Marker key={tl.id} position={[tl.lat, tl.lng]} icon={lightIcon(tl.phase)}>
            <Popup>
              <div style={{ color: '#0a0f1a', fontSize: 12 }}>
                <b>{tl.intersection}</b><br />
                Phase: {tl.phase} | Mode: {tl.mode}<br />
                Timer: {tl.timing}s | Power: {tl.powered ? '✅' : '❌'}
              </div>
            </Popup>
          </Marker>
        ))}
        <AnimatedMarkers vehicles={vehicles} />
        {incidents.filter(i => i.severity === 'critical' && i.status === 'active').map(inc => (
          <Circle
            key={`zone-${inc.id}`}
            center={[inc.lat, inc.lng]}
            radius={800}
            pathOptions={{ color: '#ef4444', fillColor: '#ef444440', fillOpacity: 0.2, weight: 1 }}
          />
        ))}
      </MapContainer>
    </motion.div>
  );
}
