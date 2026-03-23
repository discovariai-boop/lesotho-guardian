import { motion } from 'framer-motion';
import { Route, Wrench } from 'lucide-react';
import type { RoadSegment } from '@/hooks/useRealTimeRoadData';

const sevColors: Record<string, string> = {
  good: 'text-transport-green bg-transport-green/10',
  fair: 'text-transport-yellow bg-transport-yellow/10',
  poor: 'text-primary bg-primary/10',
  critical: 'text-destructive bg-destructive/10',
};

export default function RoadInfrastructureHealth({ roads }: { roads: RoadSegment[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="glass-panel p-4 h-full flex flex-col"
    >
      <div className="flex items-center gap-2 mb-3">
        <Route className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Road Infrastructure Health</h2>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2">
        {roads.map((road) => {
          const volRatio = road.trafficVolume / Math.max(road.historicalAvg, 1);
          return (
            <div key={road.id} className="glass-panel-sm p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">{road.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${sevColors[road.severity]}`}>
                  {road.severity}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div>
                  <p className="text-muted-foreground">Potholes</p>
                  <p className="font-mono text-foreground">{road.potholes}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Volume</p>
                  <p className={`font-mono ${volRatio > 1.2 ? 'text-destructive' : 'text-foreground'}`}>
                    {road.trafficVolume}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sensors</p>
                  <p className={`font-mono ${road.sensorStatus === 'online' ? 'text-transport-green' : 'text-destructive'}`}>
                    {road.sensorStatus}
                  </p>
                </div>
              </div>
              {road.maintenanceStatus !== 'none' && (
                <div className="flex items-center gap-1 text-[10px] text-primary">
                  <Wrench className="w-2.5 h-2.5" />
                  Maintenance {road.maintenanceStatus}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
