import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Navigation2, Crosshair, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import type { Incident, EmergencyVehicle, TrafficLight } from '@/hooks/useRealTimeRoadData';

const MASERU_CENTER: [number, number] = [-29.3151, 27.4869];

function mkIcon(bg: string, symbol: string) {
  return L.divIcon({
    className: '',
    html: `<div style="width:30px;height:30px;border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px ${bg}99;border:2.5px solid #fff;">${symbol}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

const INC_ICONS: Record<string, L.DivIcon> = {
  crash:      mkIcon('#ef4444', '💥'),
  pothole:    mkIcon('#eab308', '⚠️'),
  congestion: mkIcon('#3b82f6', '🚗'),
  closure:    mkIcon('#8b5cf6', '🚧'),
  sos:        mkIcon('#dc2626', '🆘'),
};
const VEH_ICONS: Record<string, L.DivIcon> = {
  ambulance: mkIcon('#0ea5e9', '🚑'),
  police:    mkIcon('#2563eb', '🚔'),
  fire:      mkIcon('#f97316', '🚒'),
};
const lightIcon = (phase: string) =>
  mkIcon(phase === 'green' ? '#16a34a' : phase === 'yellow' ? '#ca8a04' : '#dc2626', '🚦');

type LayerKey = 'incidents' | 'vehicles' | 'lights';

interface Props {
  incidents: Incident[];
  vehicles: EmergencyVehicle[];
  trafficLights: TrafficLight[];
}

export default function SmartLesothoTransportMap({ incidents, vehicles, trafficLights }: Props) {
  const wrapperRef   = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);
  const tileRef      = useRef<L.TileLayer | null>(null);
  const incLayer     = useRef(L.layerGroup());
  const vehLayer     = useRef(L.layerGroup());
  const lgtLayer     = useRef(L.layerGroup());

  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({ incidents: true, vehicles: true, lights: true });
  const [dark, setDark] = useState(false);

  /* ── Map bootstrap ── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const map = L.map(el, {
      center: MASERU_CENTER,
      zoom: 12,
      zoomControl: false,
      preferCanvas: true,
    });

    const tile = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CARTO',
      maxZoom: 19,
    }).addTo(map);

    tileRef.current = tile;
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    incLayer.current.addTo(map);
    vehLayer.current.addTo(map);
    lgtLayer.current.addTo(map);
    mapRef.current = map;

    /* ResizeObserver keeps the map correctly sized whenever the panel resizes */
    const ro = new ResizeObserver(() => { map.invalidateSize(); });
    if (wrapperRef.current) ro.observe(wrapperRef.current);

    /* Belt-and-suspenders: also invalidate after a short delay */
    const t = setTimeout(() => map.invalidateSize(), 200);

    return () => {
      clearTimeout(t);
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  /* ── Tile style toggle ── */
  useEffect(() => {
    tileRef.current?.setUrl(
      dark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    );
  }, [dark]);

  /* ── Layer visibility ── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    layers.incidents ? incLayer.current.addTo(map) : incLayer.current.remove();
    layers.vehicles  ? vehLayer.current.addTo(map) : vehLayer.current.remove();
    layers.lights    ? lgtLayer.current.addTo(map) : lgtLayer.current.remove();
  }, [layers]);

  /* ── Incidents ── */
  useEffect(() => {
    const g = incLayer.current;
    g.clearLayers();
    incidents.filter(i => i.status !== 'resolved').forEach(inc => {
      const bg = inc.severity === 'critical' ? '#fee2e2' : inc.severity === 'high' ? '#dbeafe' : inc.severity === 'medium' ? '#fef9c3' : '#dcfce7';
      const fg = inc.severity === 'critical' ? '#b91c1c' : inc.severity === 'high' ? '#1d4ed8' : inc.severity === 'medium' ? '#a16207' : '#15803d';
      L.marker([inc.lat, inc.lng], { icon: INC_ICONS[inc.type] })
        .bindPopup(
          `<div style="font-family:Inter,sans-serif;font-size:12px;min-width:180px">
            <div style="display:flex;gap:6px;align-items:center;margin-bottom:5px">
              <b>${inc.id}</b>
              <span style="background:${bg};color:${fg};padding:1px 6px;border-radius:6px;font-size:10px;font-weight:700">${inc.severity.toUpperCase()}</span>
            </div>
            <div style="font-weight:600;text-transform:capitalize">${inc.type}</div>
            <div style="color:#64748b;font-size:11px;margin:3px 0">${inc.location}</div>
            <div style="font-size:11px">Lanes affected: <b>${inc.affectedLanes}</b></div>
            <div style="font-size:11px">Reported by: <b>${inc.reportedBy}</b></div>
            ${inc.assignedUnit ? `<div style="font-size:11px;margin-top:3px">Unit: <b>${inc.assignedUnit}</b>${inc.eta ? ` · ETA <b>${inc.eta}m</b>` : ''}</div>` : ''}
          </div>`
        )
        .addTo(g);
      if (inc.severity === 'critical') {
        L.circle([inc.lat, inc.lng], { radius: 600, color: '#ef4444', fillColor: '#ef444415', fillOpacity: 1, weight: 1.5, dashArray: '5,4' }).addTo(g);
      }
    });
  }, [incidents]);

  /* ── Vehicles ── */
  useEffect(() => {
    const g = vehLayer.current;
    g.clearLayers();
    vehicles.forEach(v => {
      L.marker([v.lat, v.lng], { icon: VEH_ICONS[v.type] })
        .bindPopup(`<div style="font-family:Inter,sans-serif;font-size:12px"><b>${v.callsign}</b><br>Type: <b>${v.type}</b><br>Status: <b>${v.status}</b><br>Speed: <b>${Math.round(v.speed)} km/h</b></div>`)
        .addTo(g);
    });
  }, [vehicles]);

  /* ── Traffic lights ── */
  useEffect(() => {
    const g = lgtLayer.current;
    g.clearLayers();
    trafficLights.forEach(tl => {
      L.marker([tl.lat, tl.lng], { icon: lightIcon(tl.phase) })
        .bindPopup(`<div style="font-family:Inter,sans-serif;font-size:12px"><b>${tl.intersection}</b><br>Phase: <b style="color:${tl.phase === 'green' ? '#16a34a' : tl.phase === 'yellow' ? '#ca8a04' : '#dc2626'}">${tl.phase.toUpperCase()}</b> · Mode: <b>${tl.mode}</b><br>Timer: <b>${tl.timing}s</b> · Avg wait: <b>${tl.avgWaitTime}s</b><br>Power: ${tl.powered ? '✅ On' : '❌ Off'}</div>`)
        .addTo(g);
    });
  }, [trafficLights]);

  const toggleLayer = (k: LayerKey) => setLayers(p => ({ ...p, [k]: !p[k] }));
  const activeCount = incidents.filter(i => i.status !== 'resolved').length;

  const layerDefs: { key: LayerKey; label: string; color: string; count: number }[] = [
    { key: 'incidents', label: 'Incidents',  color: '#ef4444', count: activeCount },
    { key: 'vehicles',  label: 'Vehicles',   color: '#0ea5e9', count: vehicles.length },
    { key: 'lights',    label: 'Signals',    color: '#22c55e', count: trafficLights.length },
  ];

  return (
    /* Outer wrapper: fills whatever space the parent gives it */
    <div ref={wrapperRef} className="relative w-full h-full rounded-[24px] overflow-hidden"
      style={{ border: '1.5px solid rgba(180,200,230,0.45)', boxShadow: '0 4px 24px rgba(59,130,246,0.06)' }}>

      {/* Leaflet container: absolutely fills the wrapper — always has real pixel dimensions */}
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />

      {/* ── Top-left: title + layer toggles ── */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2" style={{ pointerEvents: 'auto' }}>
        <div className="glass-panel-sm px-3 py-2 flex items-center gap-2 shadow-md">
          <Navigation2 className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">National Transport Map</span>
          <span className="w-2 h-2 bg-green-500 rounded-full status-pulse ml-1" />
        </div>

        <div className="glass-panel-sm px-3 py-2.5 flex flex-col gap-2 shadow-md">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Layers</p>
          {layerDefs.map(({ key, label, color, count }) => (
            <button key={key} onClick={() => toggleLayer(key)}
              className="flex items-center gap-2 text-[11px] hover:opacity-75 transition-opacity text-left w-full">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ background: color, opacity: layers[key] ? 1 : 0.25 }} />
              {layers[key]
                ? <Eye className="w-3 h-3 text-foreground" />
                : <EyeOff className="w-3 h-3 text-muted-foreground" />}
              <span className={layers[key] ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
              <span className="ml-auto text-[10px] font-mono text-muted-foreground">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Top-right: dark mode + re-centre ── */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5" style={{ pointerEvents: 'auto' }}>
        <button onClick={() => setDark(d => !d)}
          className="glass-panel-sm px-2.5 py-1.5 flex items-center gap-1.5 text-[11px] font-medium text-foreground hover:bg-white/60 transition-colors shadow-md">
          {dark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-500" />}
          {dark ? 'Light Map' : 'Dark Map'}
        </button>
        <button onClick={() => mapRef.current?.flyTo(MASERU_CENTER, 12, { duration: 1 })}
          className="glass-panel-sm px-2.5 py-1.5 flex items-center gap-1.5 text-[11px] font-medium text-foreground hover:bg-white/60 transition-colors shadow-md">
          <Crosshair className="w-3.5 h-3.5 text-primary" />
          Re-centre
        </button>
      </div>

      {/* ── Bottom-left: severity legend ── */}
      <div className="absolute bottom-3 left-3 z-[1000] glass-panel-sm px-3 py-1.5 flex items-center gap-3 shadow-md">
        {[
          { col: '#ef4444', label: 'Critical' },
          { col: '#3b82f6', label: 'High' },
          { col: '#eab308', label: 'Medium' },
          { col: '#22c55e', label: 'Low' },
        ].map(({ col, label }) => (
          <span key={label} className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
