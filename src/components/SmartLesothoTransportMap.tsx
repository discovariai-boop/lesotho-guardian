import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { Navigation2, Crosshair, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import type { Incident, EmergencyVehicle, TrafficLight } from '@/hooks/useRealTimeRoadData';

const MASERU_CENTER: [number, number] = [-29.3151, 27.4869];

function createDivIcon(bg: string, symbol: string, glow = false) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:32px;height:32px;border-radius:50%;background:${bg};
      display:flex;align-items:center;justify-content:center;font-size:13px;
      box-shadow:0 2px 10px ${bg}88${glow ? `,0 0 0 6px ${bg}22` : ''};
      border:2.5px solid rgba(255,255,255,0.9);
    ">${symbol}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

const incidentIcons: Record<string, L.DivIcon> = {
  crash:      createDivIcon('#ef4444', '💥', true),
  pothole:    createDivIcon('#eab308', '⚠️'),
  congestion: createDivIcon('#3b82f6', '🚗'),
  closure:    createDivIcon('#8b5cf6', '🚧'),
  sos:        createDivIcon('#dc2626', '🆘', true),
};
const vehicleIcons: Record<string, L.DivIcon> = {
  ambulance: createDivIcon('#0ea5e9', '🚑'),
  police:    createDivIcon('#2563eb', '🚔'),
  fire:      createDivIcon('#f97316', '🚒'),
};
const lightIconFn = (phase: string) =>
  createDivIcon(phase === 'green' ? '#16a34a' : phase === 'yellow' ? '#ca8a04' : '#dc2626', '🚦');

type LayerKey = 'incidents' | 'vehicles' | 'lights';

interface Props {
  incidents: Incident[];
  vehicles: EmergencyVehicle[];
  trafficLights: TrafficLight[];
}

export default function SmartLesothoTransportMap({ incidents, vehicles, trafficLights }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const incidentLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const vehicleLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const lightLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({ incidents: true, vehicles: true, lights: true });
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { center: MASERU_CENTER, zoom: 12, zoomControl: false });
    const tile = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CARTO', maxZoom: 19,
    }).addTo(map);
    tileRef.current = tile;
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    incidentLayerRef.current.addTo(map);
    vehicleLayerRef.current.addTo(map);
    lightLayerRef.current.addTo(map);
    mapRef.current = map;
    // Allow layout to settle before invalidating size
    const t = setTimeout(() => map.invalidateSize(), 150);
    return () => { clearTimeout(t); map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    tileRef.current?.setUrl(
      dark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    );
  }, [dark]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    layers.incidents ? incidentLayerRef.current.addTo(map) : incidentLayerRef.current.remove();
    layers.vehicles  ? vehicleLayerRef.current.addTo(map)  : vehicleLayerRef.current.remove();
    layers.lights    ? lightLayerRef.current.addTo(map)    : lightLayerRef.current.remove();
  }, [layers]);

  useEffect(() => {
    const group = incidentLayerRef.current;
    group.clearLayers();
    incidents.filter(i => i.status !== 'resolved').forEach(inc => {
      const sev = inc.severity;
      const sevBg = sev === 'critical' ? '#fee2e2' : sev === 'high' ? '#dbeafe' : sev === 'medium' ? '#fef9c3' : '#dcfce7';
      const sevFg = sev === 'critical' ? '#b91c1c' : sev === 'high' ? '#1d4ed8' : sev === 'medium' ? '#a16207' : '#15803d';
      L.marker([inc.lat, inc.lng], { icon: incidentIcons[inc.type] })
        .bindPopup(`<div style="font-family:Inter,sans-serif;font-size:12px;min-width:180px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
            <span style="font-weight:700;font-size:13px">${inc.id}</span>
            <span style="background:${sevBg};color:${sevFg};padding:1px 7px;border-radius:8px;font-size:10px;font-weight:600">${sev.toUpperCase()}</span>
          </div>
          <div style="font-weight:600;text-transform:capitalize;margin-bottom:2px">${inc.type}</div>
          <div style="color:#64748b;font-size:11px;margin-bottom:6px">${inc.location}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;font-size:11px;color:#334155">
            <span>Lanes: <b>${inc.affectedLanes}</b></span>
            <span>Via: <b>${inc.reportedBy}</b></span>
            ${inc.assignedUnit ? `<span style="grid-column:1/-1">Unit: <b>${inc.assignedUnit}</b>${inc.eta ? ` · ETA <b>${inc.eta}m</b>` : ''}</span>` : ''}
          </div>
        </div>`)
        .addTo(group);
      if (inc.severity === 'critical') {
        L.circle([inc.lat, inc.lng], {
          radius: 600, color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.08,
          weight: 1.5, dashArray: '5,4',
        }).addTo(group);
      }
    });
  }, [incidents]);

  useEffect(() => {
    const group = vehicleLayerRef.current;
    group.clearLayers();
    vehicles.forEach(v => {
      L.marker([v.lat, v.lng], { icon: vehicleIcons[v.type] })
        .bindPopup(`<div style="font-family:Inter,sans-serif;font-size:12px">
          <b>${v.callsign}</b><br/>
          Type: <b>${v.type}</b> · Status: <b>${v.status}</b><br/>
          Speed: <b>${Math.round(v.speed)} km/h</b>
        </div>`)
        .addTo(group);
    });
  }, [vehicles]);

  useEffect(() => {
    const group = lightLayerRef.current;
    group.clearLayers();
    trafficLights.forEach(tl => {
      L.marker([tl.lat, tl.lng], { icon: lightIconFn(tl.phase) })
        .bindPopup(`<div style="font-family:Inter,sans-serif;font-size:12px">
          <b>${tl.intersection}</b><br/>
          Phase: <b style="color:${tl.phase === 'green' ? '#16a34a' : tl.phase === 'yellow' ? '#ca8a04' : '#dc2626'}">${tl.phase.toUpperCase()}</b>
          · Mode: <b>${tl.mode}</b><br/>
          Timer: <b>${tl.timing}s</b> · Avg Wait: <b>${tl.avgWaitTime}s</b><br/>
          Power: ${tl.powered ? '✅ On' : '❌ Off'}
        </div>`)
        .addTo(group);
    });
  }, [trafficLights]);

  const toggleLayer = (k: LayerKey) => setLayers(p => ({ ...p, [k]: !p[k] }));
  const activeCount = incidents.filter(i => i.status !== 'resolved').length;

  const layerDefs: { key: LayerKey; label: string; color: string; count?: number }[] = [
    { key: 'incidents', label: 'Incidents', color: '#ef4444', count: activeCount },
    { key: 'vehicles',  label: 'Vehicles',  color: '#0ea5e9', count: vehicles.length },
    { key: 'lights',    label: 'Signals',   color: '#22c55e', count: trafficLights.length },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      className="glass-panel overflow-hidden relative h-full flex flex-col">

      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2 pointer-events-auto">
        <div className="glass-panel-sm px-3 py-2 flex items-center gap-2 shadow-md">
          <Navigation2 className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">National Transport Map</span>
          <span className="w-2 h-2 bg-green-500 rounded-full status-pulse ml-1" />
        </div>

        <div className="glass-panel-sm px-3 py-2.5 flex flex-col gap-2 shadow-md">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Layers</p>
          {layerDefs.map(({ key, label, color, count }) => (
            <button key={key} onClick={() => toggleLayer(key)}
              className="flex items-center gap-2 text-[11px] hover:opacity-75 transition-opacity text-left w-full">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0 transition-opacity"
                style={{ background: color, opacity: layers[key] ? 1 : 0.25 }} />
              {layers[key]
                ? <Eye className="w-3 h-3 text-foreground" />
                : <EyeOff className="w-3 h-3 text-muted-foreground" />}
              <span className={layers[key] ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
              {count !== undefined && (
                <span className="ml-auto text-[10px] font-mono text-muted-foreground">{count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5 pointer-events-auto">
        <button onClick={() => setDark(d => !d)}
          className="glass-panel-sm px-2.5 py-1.5 flex items-center gap-1.5 text-[11px] font-medium text-foreground hover:bg-muted/40 transition-colors shadow-md">
          {dark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-500" />}
          {dark ? 'Light Map' : 'Dark Map'}
        </button>
        <button onClick={() => mapRef.current?.flyTo(MASERU_CENTER, 12, { duration: 1 })}
          className="glass-panel-sm px-2.5 py-1.5 flex items-center gap-1.5 text-[11px] font-medium text-foreground hover:bg-muted/40 transition-colors shadow-md">
          <Crosshair className="w-3.5 h-3.5 text-primary" />
          Re-centre
        </button>
      </div>

      <div className="absolute bottom-3 left-3 z-[1000] glass-panel-sm px-3 py-1.5 flex items-center gap-3 shadow-md">
        {[
          { col: '#ef4444', label: 'Critical' },
          { col: '#3b82f6', label: 'High' },
          { col: '#eab308', label: 'Medium' },
          { col: '#22c55e', label: 'Low / Resolved' },
        ].map(({ col, label }) => (
          <span key={label} className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col }} />
            {label}
          </span>
        ))}
      </div>

      <div ref={containerRef} className="flex-1 w-full" style={{ minHeight: 0 }} />
    </motion.div>
  );
}
