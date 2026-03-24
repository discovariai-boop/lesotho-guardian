import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Activity, PieChart } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
  Tooltip, CartesianGrid, Legend, Cell,
} from 'recharts';
import type { DashboardStats } from '@/hooks/useRealTimeRoadData';

const trafficForecast = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  predicted: Math.round(400 + Math.sin(i / 3.8) * 300 + Math.random() * 80),
  actual: i <= 14 ? Math.round(380 + Math.sin(i / 3.8) * 280 + Math.random() * 100) : undefined,
}));

const incidentBreakdown = [
  { type: 'Crash',     count: 18, color: '#ef4444' },
  { type: 'Congestion',count: 31, color: '#3b82f6' },
  { type: 'Pothole',   count: 24, color: '#eab308' },
  { type: 'Closure',   count: 9,  color: '#8b5cf6' },
  { type: 'SOS',       count: 5,  color: '#f97316' },
];

const responseTimeTrend = [
  { day: 'Mon', time: 9.2 }, { day: 'Tue', time: 8.7 }, { day: 'Wed', time: 10.1 },
  { day: 'Thu', time: 7.9 }, { day: 'Fri', time: 8.4 }, { day: 'Sat', time: 11.2 },
  { day: 'Sun', time: 7.1 },
];

const TOOLTIP_STYLE = {
  contentStyle: { background: 'rgba(255,255,255,0.97)', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 11, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
  labelStyle: { color: '#1e293b', fontWeight: 600 },
};

export default function AnalyticsPanel({ stats }: { stats: DashboardStats }) {
  const kpis = useMemo(() => [
    { label: 'Sensor Uptime',  value: `${stats.sensorUptime}%`,  trend: '+0.3%',  positive: true },
    { label: 'Lights Online',  value: `${stats.lightsOnline.toFixed(0)}%`, trend: '—', positive: null },
    { label: 'Resolved Today', value: stats.resolvedToday,       trend: `+${Math.max(0, stats.resolvedToday - 12)}`, positive: true },
    { label: 'Active Now',     value: stats.activeIncidents,     trend: stats.activeIncidents > 8 ? '⚠' : '✓', positive: stats.activeIncidents <= 8 },
  ], [stats]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
      className="glass-panel p-4 flex flex-col h-full overflow-y-auto scrollbar-thin">

      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Predictive Analytics</h2>
        <span className="ml-auto text-[10px] text-muted-foreground">Live · Updated every 3s</span>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {kpis.map(k => (
          <div key={k.label} className="glass-panel-sm p-2.5 text-center">
            <p className="text-lg font-mono font-bold text-foreground">{k.value}</p>
            <p className="text-[9px] text-muted-foreground leading-tight">{k.label}</p>
            <p className={`text-[9px] font-semibold mt-0.5 ${k.positive === true ? 'text-green-600' : k.positive === false ? 'text-red-500' : 'text-muted-foreground'}`}>
              {k.trend}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <p className="text-[10px] font-semibold text-muted-foreground mb-2 flex items-center gap-1.5 uppercase tracking-wider">
          <TrendingUp className="w-3 h-3" />
          24-Hour Traffic Volume Forecast
        </p>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trafficForecast} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3,3" stroke="#e2e8f0" strokeOpacity={0.6} />
              <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={3} />
              <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={28} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="predicted" name="Predicted" stroke="#3b82f6" fill="url(#gP)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="actual" name="Actual" stroke="#0ea5e9" fill="url(#gA)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground mb-2 flex items-center gap-1.5 uppercase tracking-wider">
            <PieChart className="w-3 h-3" />
            Incidents by Type (Last 7 Days)
          </p>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentBreakdown} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3,3" stroke="#e2e8f0" strokeOpacity={0.5} vertical={false} />
                <XAxis dataKey="type" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={22} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="count" name="Incidents" radius={[4, 4, 0, 0]}>
                  {incidentBreakdown.map((entry) => (
                    <Cell key={entry.type} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold text-muted-foreground mb-2 flex items-center gap-1.5 uppercase tracking-wider">
            <Activity className="w-3 h-3" />
            Response Time (min) — This Week
          </p>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={responseTimeTrend} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3,3" stroke="#e2e8f0" strokeOpacity={0.5} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={22} domain={[0, 14]} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`${v} min`, 'Avg Response']} />
                <Bar dataKey="time" name="Avg Response" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>Target: <b className="text-foreground">8.0 min</b></span>
            <span className="ml-auto">
              Weekly avg: <b className={stats.avgResponseTime <= 8 ? 'text-green-600' : 'text-red-500'}>{stats.avgResponseTime}m</b>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
