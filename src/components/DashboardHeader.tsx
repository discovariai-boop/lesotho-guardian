import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Bell, User, Wifi, WifiOff, Clock } from 'lucide-react';
import type { DashboardStats } from '@/hooks/useRealTimeRoadData';

interface Props { stats: DashboardStats; }

export default function DashboardHeader({ stats }: Props) {
  const [time, setTime] = useState(new Date());
  const [notifications] = useState(3);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const isGoodFlow = stats.trafficFlow >= 70;

  return (
    <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
      className="glass-panel-sm px-4 py-2.5 flex items-center justify-between gap-4">

      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-blue-600/10 flex items-center justify-center flex-shrink-0">
          <Shield className="w-4.5 h-4.5 text-primary" />
        </div>
        <div className="min-w-0">
          <h1 className="text-base font-bold tracking-tight text-foreground leading-none">LTRA Command Centre</h1>
          <p className="text-[10px] text-muted-foreground mt-0.5">Lesotho Transport & Road Agency</p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
        {[
          { label: 'Incidents', value: stats.activeIncidents, color: 'text-destructive', bg: 'hover:bg-red-50' },
          { label: 'Responding', value: stats.respondingUnits, color: 'text-primary', bg: 'hover:bg-blue-50' },
          { label: 'Response', value: `${stats.avgResponseTime}m`, color: 'text-violet-600', bg: 'hover:bg-violet-50' },
          { label: 'Flow', value: `${stats.trafficFlow.toFixed(0)}%`, color: isGoodFlow ? 'text-green-600' : 'text-orange-500', bg: 'hover:bg-green-50' },
          { label: 'Sensors', value: `${stats.sensorUptime}%`, color: 'text-teal-600', bg: 'hover:bg-teal-50' },
          { label: 'Resolved', value: stats.resolvedToday, color: 'text-emerald-600', bg: 'hover:bg-emerald-50' },
        ].map((s) => (
          <div key={s.label} className={`text-center px-3 py-1.5 rounded-xl transition-colors cursor-default ${s.bg}`}>
            <motion.p key={String(s.value)} initial={{ scale: 1.12, opacity: 0.7 }} animate={{ scale: 1, opacity: 1 }}
              className={`text-lg font-mono font-bold leading-none ${s.color}`}>
              {s.value}
            </motion.p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5 leading-none">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] bg-muted/60 px-2.5 py-1.5 rounded-lg">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="font-mono font-semibold text-foreground">
            {time.toLocaleTimeString('en-LS', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </span>
        </div>
        <div className={`flex items-center gap-1 text-[11px] px-2 py-1.5 rounded-lg ${isGoodFlow ? 'text-green-600 bg-green-50' : 'text-orange-500 bg-orange-50'}`}>
          {isGoodFlow ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          <span className="font-semibold">Live</span>
        </div>
        <button className="relative p-1.5 rounded-xl hover:bg-muted transition-colors">
          <Bell className="w-4 h-4 text-muted-foreground" />
          {notifications > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive rounded-full text-[9px] text-white font-bold flex items-center justify-center">
              {notifications}
            </span>
          )}
        </button>
        <button className="p-1.5 rounded-xl hover:bg-muted transition-colors">
          <User className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </motion.header>
  );
}
