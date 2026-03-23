import { motion } from 'framer-motion';
import { Shield, Bell, User, Wifi } from 'lucide-react';
import type { DashboardStats } from '@/hooks/useRealTimeRoadData';

interface Props { stats: DashboardStats; }

export default function DashboardHeader({ stats }: Props) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel-sm px-6 py-3 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            LTRA Command Centre
          </h1>
          <p className="text-xs text-muted-foreground">
            Lesotho Transport & Road Agency — National Dashboard
          </p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-6">
        {[
          { label: 'Active Incidents', value: stats.activeIncidents, color: 'text-destructive' },
          { label: 'Units Responding', value: stats.respondingUnits, color: 'text-primary' },
          { label: 'Avg Response', value: `${stats.avgResponseTime}m`, color: 'text-accent' },
          { label: 'Traffic Flow', value: `${stats.trafficFlow.toFixed(0)}%`, color: 'text-transport-green' },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <motion.p
              key={String(s.value)}
              initial={{ scale: 1.15, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-xl font-mono font-bold ${s.color}`}
            >
              {s.value}
            </motion.p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-transport-green text-xs">
          <Wifi className="w-3 h-3" />
          <span>Live</span>
        </div>
        <button className="relative p-2 rounded-xl hover:bg-muted transition-colors">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full status-pulse" />
        </button>
        <button className="p-2 rounded-xl hover:bg-muted transition-colors">
          <User className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </motion.header>
  );
}
