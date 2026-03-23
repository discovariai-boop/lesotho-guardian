import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, MapPin, ChevronRight } from 'lucide-react';
import type { Incident } from '@/hooks/useRealTimeRoadData';

const severityColor: Record<string, string> = {
  critical: 'bg-destructive/15 text-destructive border-destructive/30',
  high: 'bg-primary/15 text-primary border-primary/30',
  medium: 'bg-transport-yellow/15 text-transport-yellow border-transport-yellow/30',
  low: 'bg-transport-green/15 text-transport-green border-transport-green/30',
};

const statusDot: Record<string, string> = {
  active: 'bg-destructive',
  responding: 'bg-primary',
  resolved: 'bg-transport-green',
};

export default function TrafficIncidentQueue({ incidents }: { incidents: Incident[] }) {
  const sorted = [...incidents].sort((a, b) => {
    const sev = { critical: 0, high: 1, medium: 2, low: 3 };
    return (sev[a.severity] ?? 3) - (sev[b.severity] ?? 3);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-panel p-4 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Live Incident Queue</h2>
        </div>
        <span className="text-xs font-mono text-muted-foreground">{incidents.filter(i => i.status !== 'resolved').length} active</span>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2">
        <AnimatePresence mode="popLayout">
          {sorted.slice(0, 8).map((inc) => (
            <motion.div
              key={inc.id}
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              className="glass-panel-sm p-3 cursor-pointer hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${statusDot[inc.status]} ${inc.status === 'active' ? 'status-pulse' : ''}`} />
                    <span className="text-xs font-mono text-muted-foreground">{inc.id}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md border ${severityColor[inc.severity]}`}>
                      {inc.severity}
                    </span>
                  </div>
                  <p className="text-xs text-foreground truncate">{inc.location}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {inc.eta && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" />
                        ETA {inc.eta}m
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
