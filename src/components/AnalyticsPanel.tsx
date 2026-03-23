import { motion } from 'framer-motion';
import { BarChart3, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { DashboardStats } from '@/hooks/useRealTimeRoadData';

const trafficForecast = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  predicted: Math.round(400 + Math.sin(i / 3.8) * 300 + Math.random() * 100),
  actual: i < 14 ? Math.round(380 + Math.sin(i / 3.8) * 280 + Math.random() * 120) : undefined,
}));

const kpis = [
  { label: 'Sensor Uptime', value: '94.2%', trend: '+0.3%' },
  { label: 'Lights Online', value: '98%', trend: '—' },
  { label: 'Road Closures', value: '2', trend: '-1' },
  { label: 'Maint. Backlog', value: '14', trend: '+2' },
];

export default function AnalyticsPanel({ stats }: { stats: DashboardStats }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="glass-panel p-4 flex flex-col h-full"
    >
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-accent" />
        <h2 className="text-sm font-semibold text-foreground">Predictive Analytics</h2>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-3">
        {kpis.map(k => (
          <div key={k.label} className="glass-panel-sm p-2 text-center">
            <p className="text-sm font-mono font-bold text-foreground">{k.value}</p>
            <p className="text-[9px] text-muted-foreground">{k.label}</p>
            <p className="text-[9px] text-transport-green">{k.trend}</p>
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        <p className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          24-Hour Traffic Demand Forecast
        </p>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trafficForecast}>
            <defs>
              <linearGradient id="gradPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(24,100%,50%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(24,100%,50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(200,80%,50%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(200,80%,50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="hour" tick={{ fontSize: 9, fill: 'hsl(215,15%,55%)' }} tickLine={false} axisLine={false} interval={3} />
            <YAxis tick={{ fontSize: 9, fill: 'hsl(215,15%,55%)' }} tickLine={false} axisLine={false} width={30} />
            <Tooltip
              contentStyle={{ background: 'rgba(10,15,25,0.9)', border: '1px solid rgba(120,130,150,0.2)', borderRadius: 12, fontSize: 11 }}
              labelStyle={{ color: 'hsl(210,20%,90%)' }}
            />
            <Area type="monotone" dataKey="predicted" stroke="hsl(24,100%,50%)" fill="url(#gradPredicted)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="actual" stroke="hsl(200,80%,50%)" fill="url(#gradActual)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
