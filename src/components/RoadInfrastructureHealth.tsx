import { motion } from 'framer-motion';
import { Route, Wrench, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import type { RoadSegment } from '@/hooks/useRealTimeRoadData';

const CONDITION_CONFIG: Record<string, { label: string; bar: string; badge: string; dot: string }> = {
  good:     { label: 'Good',     bar: 'bg-green-500',  badge: 'bg-green-100 text-green-700 border-green-200',    dot: 'bg-green-500' },
  fair:     { label: 'Fair',     bar: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',  dot: 'bg-yellow-400' },
  poor:     { label: 'Poor',     bar: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700 border-orange-200',  dot: 'bg-orange-500' },
  critical: { label: 'Critical', bar: 'bg-red-500',    badge: 'bg-red-100 text-red-700 border-red-200',           dot: 'bg-red-500' },
};

export default function RoadInfrastructureHealth({ roads }: { roads: RoadSegment[] }) {
  const avgHealth = Math.round(roads.reduce((s, r) => s + r.healthScore, 0) / roads.length);
  const criticalCount = roads.filter(r => r.condition === 'critical').length;
  const maintenanceCount = roads.filter(r => r.maintenanceStatus !== 'none').length;
  const offlineCount = roads.filter(r => r.sensorStatus === 'offline').length;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
      className="glass-panel p-4 h-full flex flex-col">

      <div className="flex items-center gap-2 mb-3">
        <Route className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Road Infrastructure</h2>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-3">
        {[
          { label: 'Avg Health', value: `${avgHealth}%`, color: avgHealth >= 60 ? 'text-green-600' : avgHealth >= 40 ? 'text-yellow-600' : 'text-red-600', bg: 'bg-slate-50 border border-slate-100' },
          { label: 'Critical', value: criticalCount, color: 'text-red-600', bg: 'bg-red-50 border border-red-100' },
          { label: 'Maint.', value: maintenanceCount, color: 'text-blue-600', bg: 'bg-blue-50 border border-blue-100' },
          { label: 'Offline', value: offlineCount, color: 'text-orange-600', bg: 'bg-orange-50 border border-orange-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-2 text-center ${s.bg}`}>
            <p className={`text-base font-mono font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 pr-0.5">
        {roads.map((road) => {
          const cfg = CONDITION_CONFIG[road.condition];
          const volRatio = road.trafficVolume / Math.max(road.historicalAvg, 1);
          return (
            <div key={road.id} className="glass-panel-sm p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    <span className="text-xs font-semibold text-foreground truncate">{road.name}</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{road.length} km road</p>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold flex-shrink-0 ${cfg.badge}`}>
                  {cfg.label}
                </span>
              </div>

              <div>
                <div className="flex justify-between text-[9px] text-muted-foreground mb-1">
                  <span>Health Score</span>
                  <span className="font-mono font-semibold text-foreground">{road.healthScore}%</span>
                </div>
                <div className="h-1.5 bg-muted/60 rounded-full overflow-hidden">
                  <motion.div className={`h-full rounded-full ${cfg.bar}`}
                    initial={{ width: 0 }} animate={{ width: `${road.healthScore}%` }} transition={{ duration: 0.6, delay: 0.1 }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[9px]">
                <div>
                  <p className="text-muted-foreground">Potholes</p>
                  <p className={`font-mono font-semibold ${road.potholes > 10 ? 'text-red-600' : 'text-foreground'}`}>{road.potholes}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Volume</p>
                  <p className={`font-mono font-semibold ${volRatio > 1.2 ? 'text-red-600' : volRatio > 0.9 ? 'text-yellow-600' : 'text-foreground'}`}>
                    {road.trafficVolume}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sensor</p>
                  <p className={`font-mono font-semibold flex items-center gap-1 ${road.sensorStatus === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                    {road.sensorStatus === 'online' ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
                    {road.sensorStatus}
                  </p>
                </div>
              </div>

              {road.maintenanceStatus !== 'none' && (
                <div className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-lg ${
                  road.maintenanceStatus === 'in-progress' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {road.maintenanceStatus === 'in-progress' ? <Wrench className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
                  Maintenance {road.maintenanceStatus === 'in-progress' ? 'In Progress' : 'Scheduled'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
