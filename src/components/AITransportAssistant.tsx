import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  'Show all potholes on A1 today',
  'Predict congestion on A2 if rain continues',
  'Which lights need manual override?',
  'Response time stats for Maseru district',
];

const MOCK_RESPONSES: Record<string, string> = {
  'Show all potholes on A1 today': '📍 Found **7 potholes** on A1 Main South today:\n- Km 12: Severe (depth 15cm)\n- Km 28: Moderate\n- Km 34: Moderate\n- Km 41: Minor\n- Km 55: Severe (depth 20cm)\n- Km 67: Minor\n- Km 82: Moderate\n\nMaintenance crew dispatched to Km 12 and Km 55.',
  'Predict congestion on A2 if rain continues': '🌧️ **A2 Congestion Forecast:**\n\nIf current rainfall (12mm/hr) continues:\n- 30 min: Traffic flow drops to **62%** (from 78%)\n- 1 hr: Expected volume spike at Leribe junction\n- 2 hr: Recommend advisory on LED boards\n\n⚡ Suggested action: Activate wet-weather timing on TL-2 and TL-4.',
  'Which lights need manual override?': '🚦 **Manual Override Recommended:**\n\n1. Cathedral Circle — phase timing drift detected\n2. Stadium Roundabout — sensor offline 47 min\n\nAll other intersections operating within normal parameters.',
  'Response time stats for Maseru district': '📊 **Maseru District — Last 24h:**\n\n- Avg response time: **7.2 min** (target: 8 min ✅)\n- Fastest: 3.1 min (AMB-102)\n- Slowest: 14.8 min (POL-108, rural)\n- Total dispatches: 23\n- Resolution rate: 91%',
};

export default function AITransportAssistant() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);

  const handleSubmit = (text: string) => {
    const q = text || query;
    if (!q.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setTimeout(() => {
      const response = MOCK_RESPONSES[q] || `Analyzing: "${q}"...\n\nProcessing sensor data across all districts. Results will appear on the map in real-time.`;
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    }, 800);
    setQuery('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-panel p-4 h-full flex flex-col"
    >
      <div className="flex items-center gap-2 mb-3">
        <Bot className="w-4 h-4 text-accent" />
        <h2 className="text-sm font-semibold text-foreground">AI Transport Assistant</h2>
        <Sparkles className="w-3 h-3 text-primary animate-pulse-glow" />
      </div>

      {messages.length === 0 && (
        <div className="flex-1 flex flex-col justify-center gap-2">
          <p className="text-xs text-muted-foreground text-center mb-2">Ask about road conditions, traffic, or incidents</p>
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => handleSubmit(s)}
              className="text-left text-xs px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted text-foreground transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 mb-3">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-xs p-2.5 rounded-xl ${
                  msg.role === 'user' ? 'bg-primary/20 text-foreground ml-6' : 'bg-muted/50 text-foreground mr-4'
                }`}
              >
                <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit(query)}
          placeholder="Ask about roads, traffic, incidents..."
          className="flex-1 text-xs px-3 py-2 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
        <button
          onClick={() => handleSubmit(query)}
          className="p-2 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
