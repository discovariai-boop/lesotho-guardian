import { motion } from 'framer-motion';
import { CircleDot, Zap, Settings2 } from 'lucide-react';
import type { TrafficLight } from '@/hooks/useRealTimeRoadData';

const phaseColors: Record<string, string> = {
  green: 'bg-transport-green shadow-[0_0_12px_rgba(34,197,94,0.4)]',
  yellow: 'bg-transport-yellow shadow-[0_0_12px_rgba(234,179,8,0.4)]',
  red: 'bg-destructive shadow-[0_0_12px_rgba(239,68,68,0.4)]',
};

interface Props {
  lights: TrafficLight[];
  onOverride: (id: string, phase: TrafficLight['phase']) => void;
  onGreenWave: () => void;
}

export default function SmartTrafficLightControl({ lights, onOverride, onGreenWave }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-panel p-4 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CircleDot className="w-4 h-4 text-transport-green" />
          <h2 className="text-sm font-semibold text-foreground">Traffic Light Control</h2>
        </div>
        <button
          onClick={onGreenWave}
          className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-transport-green/20 text-transport-green hover:bg-transport-green/30 transition-colors"
        >
          <Zap className="w-3 h-3" />
          Green Wave
        </button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2">
        {lights.map((light) => (
          <motion.div
            key={light.id}
            layout
            className="glass-panel-sm p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{light.intersection}</p>
                <div className="flex items-center gap-2 mt-1">
                  <motion.span
                    key={light.phase}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className={`w-3 h-3 rounded-full ${phaseColors[light.phase]}`}
                  />
                  <span className="text-[10px] text-muted-foreground font-mono">{light.timing}s</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    light.mode === 'emergency' ? 'bg-destructive/20 text-destructive' :
                    light.mode === 'manual' ? 'bg-transport-orange/20 text-transport-orange' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {light.mode}
                  </span>
                  {!light.powered && (
                    <span className="text-[10px] text-destructive">⚡ No Power</span>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                {(['green', 'yellow', 'red'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => onOverride(light.id, p)}
                    className={`w-5 h-5 rounded-full border border-border/50 transition-all hover:scale-110 ${
                      light.phase === p ? phaseColors[p] : 'bg-muted/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
