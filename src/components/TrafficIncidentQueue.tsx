import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, MapPin, ChevronDown, ChevronUp, Send, CheckCircle2, Search, Filter, Users } from 'lucide-react';
import type { Incident } from '@/hooks/useRealTimeRoadData';

const TYPE_ICONS: Record<string, string> = {
  crash: '💥', pothole: '⚠️', congestion: '🚗', closure: '🚧', sos: '🆘',
};
const TYPE_COLORS: Record<string, string> = {
  crash: 'bg-red-50 text-red-700 border-red-200',
  pothole: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  congestion: 'bg-blue-50 text-blue-700 border-blue-200',
  closure: 'bg-purple-50 text-purple-700 border-purple-200',
  sos: 'bg-rose-50 text-rose-700 border-rose-200',
};
const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 border-red-300',
  high: 'bg-blue-100 text-blue-700 border-blue-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  low: 'bg-green-100 text-green-700 border-green-300',
};
const STATUS_DOT: Record<string, string> = {
  active: 'bg-red-500',
  responding: 'bg-blue-500',
  resolved: 'bg-green-500',
};
const UNITS = ['AMB-03', 'AMB-07', 'POL-04', 'POL-12', 'FIRE-05', 'UNIT-09'];

interface Props {
  incidents: Incident[];
  onResolve?: (id: string) => void;
  onDispatch?: (id: string, unit: string) => void;
  fullView?: boolean;
}

export default function TrafficIncidentQueue({ incidents, onResolve, onDispatch, fullView = false }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 };

  const filtered = [...incidents]
    .filter(i => statusFilter === 'all' || i.status === statusFilter)
    .filter(i => typeFilter === 'all' || i.type === typeFilter)
    .filter(i => !search || i.location.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (sevOrder[a.severity] ?? 3) - (sevOrder[b.severity] ?? 3));

  const activeCount = incidents.filter(i => i.status !== 'resolved').length;
  const respondingCount = incidents.filter(i => i.status === 'responding').length;
  const resolvedCount = incidents.filter(i => i.status === 'resolved').length;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="glass-panel p-4 h-full flex flex-col">

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <h2 className="text-sm font-semibold text-foreground">Live Incident Queue</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-mono font-semibold">{activeCount} active</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-mono">{respondingCount} responding</span>
        </div>
      </div>

      {fullView && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: 'Active', value: activeCount, color: 'text-destructive', bg: 'bg-red-50 border border-red-100' },
            { label: 'Responding', value: respondingCount, color: 'text-primary', bg: 'bg-blue-50 border border-blue-100' },
            { label: 'Resolved Today', value: resolvedCount, color: 'text-green-600', bg: 'bg-green-50 border border-green-100' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl p-2.5 text-center ${s.bg}`}>
              <p className={`text-xl font-mono font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 relative">
          <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search incidents..."
            className="w-full pl-7 pr-2 py-1.5 text-[11px] rounded-lg bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40" />
        </div>
        <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
      </div>

      <div className="flex gap-1 mb-3 flex-wrap">
        {(['all', 'active', 'responding', 'resolved'] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`text-[10px] px-2.5 py-1 rounded-full transition-colors capitalize ${statusFilter === s ? 'bg-primary text-white' : 'bg-muted/60 text-muted-foreground hover:bg-muted'}`}>
            {s}
          </button>
        ))}
        <div className="w-px bg-border mx-0.5" />
        {(['all', 'crash', 'pothole', 'congestion', 'closure', 'sos'] as const).map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`text-[10px] px-2.5 py-1 rounded-full transition-colors capitalize ${typeFilter === t ? 'bg-primary/90 text-white' : 'bg-muted/60 text-muted-foreground hover:bg-muted'}`}>
            {t === 'all' ? 'All Types' : `${TYPE_ICONS[t]} ${t}`}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 pr-0.5">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 text-muted-foreground text-xs">
              No incidents match your filters.
            </motion.div>
          )}
          {filtered.map(inc => {
            const isExpanded = expanded === inc.id;
            return (
              <motion.div key={inc.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                className={`glass-panel-sm p-3 transition-all ${inc.status === 'resolved' ? 'opacity-60' : ''}`}>

                <button className="w-full text-left" onClick={() => setExpanded(isExpanded ? null : inc.id)}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[inc.status]} ${inc.status === 'active' ? 'status-pulse' : ''}`} />
                        <span className="text-[10px] font-mono font-semibold text-muted-foreground">{inc.id}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${SEVERITY_COLORS[inc.severity]}`}>{inc.severity.toUpperCase()}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border ${TYPE_COLORS[inc.type]}`}>
                          {TYPE_ICONS[inc.type]} {inc.type}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-foreground truncate">{inc.location}</p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {inc.eta && <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />ETA {inc.eta}m</span>}
                        {inc.assignedUnit && (
                          <span className="flex items-center gap-1 text-primary">
                            <Users className="w-2.5 h-2.5" />{inc.assignedUnit}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-muted-foreground flex-shrink-0 mt-1">
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="mt-2.5 pt-2.5 border-t border-border/50 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="bg-muted/50 rounded-lg p-2">
                            <p className="text-muted-foreground mb-0.5">Reported By</p>
                            <p className="font-semibold text-foreground">{inc.reportedBy}</p>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-2">
                            <p className="text-muted-foreground mb-0.5">Affected Lanes</p>
                            <p className="font-semibold text-foreground">{inc.affectedLanes} lane{inc.affectedLanes !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{inc.description}</p>

                        {inc.status !== 'resolved' && onDispatch && onResolve && (
                          <div className="flex gap-2 pt-1">
                            {inc.status === 'active' && (
                              <select onChange={e => e.target.value && onDispatch(inc.id, e.target.value)}
                                className="flex-1 text-[10px] py-1 px-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40">
                                <option value="">Dispatch Unit...</option>
                                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                              </select>
                            )}
                            <button onClick={() => onResolve(inc.id)}
                              className="flex items-center gap-1 text-[10px] px-3 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              Resolve
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
