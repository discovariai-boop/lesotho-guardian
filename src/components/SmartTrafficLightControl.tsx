import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrafficCone, Zap, PowerOff, RefreshCw, Timer, TrendingUp } from 'lucide-react';
import type { TrafficLight } from '@/hooks/useRealTimeRoadData';

const PHASE_BG: Record<string, string> = {
  green:  'bg-green-500  shadow-[0_0_16px_rgba(34,197,94,0.5)]',
  yellow: 'bg-yellow-400 shadow-[0_0_16px_rgba(234,179,8,0.5)]',
  red:    'bg-red-500    shadow-[0_0_16px_rgba(239,68,68,0.5)]',
};
const PHASE_DIM: Record<string, string> = {
  green:  'bg-green-900/30',
  yellow: 'bg-yellow-900/30',
  red:    'bg-red-900/30',
};
const MODE_BADGE: Record<string, string> = {
  emergency: 'bg-red-100 text-red-700 border-red-300',
  manual:    'bg-blue-100 text-blue-700 border-blue-300',
  auto:      'bg-slate-100 text-slate-600 border-slate-200',
  off:       'bg-gray-100 text-gray-500 border-gray-200',
};

interface Props {
  lights: TrafficLight[];
  onOverride: (id: string, phase: TrafficLight['phase']) => void;
  onGreenWave: () => void;
}

export default function SmartTrafficLightControl({ lights, onOverride, onGreenWave }: Props) {
  const [greenWaveActive, setGreenWaveActive] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const powered = lights.filter(l => l.powered && l.mode !== 'off').length;
  const emergencyCount = lights.filter(l => l.mode === 'emergency').length;
  const avgWait = (lights.reduce((s, l) => s + l.avgWaitTime, 0) / lights.length).toFixed(1);

  const handleGreenWave = () => {
    setGreenWaveActive(true);
    onGreenWave();
    setTimeout(() => setGreenWaveActive(false), 15000);
  };

  const selected = lights.find(l => l.id === selectedId);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className="glass-panel p-4 h-full flex flex-col">

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrafficCone className="w-4 h-4 text-green-600" />
          <h2 className="text-sm font-semibold text-foreground">Traffic Signal Control</h2>
        </div>
        <button onClick={handleGreenWave} disabled={greenWaveActive}
          className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
            greenWaveActive
              ? 'bg-green-500 text-white animate-pulse cursor-not-allowed'
              : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
          }`}>
          <Zap className="w-3 h-3" />
          {greenWaveActive ? 'ACTIVE 15s' : 'Green Wave'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: 'Online', value: powered, color: 'text-green-600', bg: 'bg-green-50 border border-green-100' },
          { label: 'Emergency', value: emergencyCount, color: 'text-red-600', bg: 'bg-red-50 border border-red-100' },
          { label: 'Avg Wait', value: `${avgWait}s`, color: 'text-blue-600', bg: 'bg-blue-50 border border-blue-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-2 text-center ${s.bg}`}>
            <p className={`text-base font-mono font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-2">
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 pr-0.5">
          {lights.map((light) => {
            const isSelected = selectedId === light.id;
            return (
              <motion.div key={light.id} layout
                className={`glass-panel-sm p-3 cursor-pointer transition-all ${isSelected ? 'ring-1 ring-primary/40' : ''} ${!light.powered ? 'opacity-50' : ''}`}
                onClick={() => setSelectedId(isSelected ? null : light.id)}>

                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1 flex-shrink-0 bg-gray-900 rounded-md px-1.5 py-1.5">
                    {(['red', 'yellow', 'green'] as const).map(p => (
                      <motion.span key={p}
                        animate={{ opacity: light.phase === p && light.powered ? 1 : 0.15 }}
                        className={`w-3.5 h-3.5 rounded-full ${p === 'green' ? 'bg-green-400' : p === 'yellow' ? 'bg-yellow-400' : 'bg-red-400'} ${light.phase === p && light.powered ? PHASE_BG[p].split(' ')[1] : ''}`} />
                    ))}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{light.intersection}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${MODE_BADGE[light.mode]}`}>
                        {light.mode.toUpperCase()}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Timer className="w-2.5 h-2.5" />{light.timing}s
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <TrendingUp className="w-2.5 h-2.5" />{light.avgWaitTime}s avg
                      </span>
                      {!light.powered && <span className="text-[9px] text-red-500 font-semibold">⚡ OFFLINE</span>}
                    </div>

                    <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
                      <motion.div className={`h-full rounded-full ${
                        light.phase === 'green' ? 'bg-green-500' : light.phase === 'yellow' ? 'bg-yellow-400' : 'bg-red-500'
                      }`}
                        animate={{ width: `${Math.min(100, (light.timing / 60) * 100)}%` }}
                        transition={{ duration: 0.5 }} />
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isSelected && light.powered && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="mt-3 pt-2.5 border-t border-border/50">
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-2 font-semibold">Manual Override</p>
                        <div className="flex gap-2">
                          {(['green', 'yellow', 'red'] as const).map(p => (
                            <button key={p} onClick={e => { e.stopPropagation(); onOverride(light.id, p); }}
                              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                                light.phase === p
                                  ? `${PHASE_BG[p]} text-white border-transparent`
                                  : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/30'
                              }`}>
                              {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                          <span>Cycles: <b className="text-foreground">{light.cycleCount}</b></span>
                          <span>ID: <b className="text-foreground font-mono">{light.id}</b></span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
