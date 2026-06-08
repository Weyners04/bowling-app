import { useState, useMemo } from 'react';
import { TrendingUp, Clock, Trash2 } from 'lucide-react';
import { tailwindColorMap } from '../constants';

const GRAPH_W = 600;
const GRAPH_H = 250;
const PAD_X = 50;
const PAD_Y = 50;
const MIN_LABEL_SPACING = 45;

const PERIODS = [
  { val: 'global',    label: 'Global' },
  { val: 'trimestre', label: '3 mois' },
];

export default function Dashboard({ players, scores, onSelectPlayer, onDeleteScore }) {
  const [period, setPeriod] = useState('global');

  const filteredScores = useMemo(() => {
    if (period === 'global') return scores;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 3);
    return scores.filter(s => new Date(s.date) >= cutoff);
  }, [scores, period]);

  const stats = useMemo(() => {
    return players.map(p => {
      const pScores = filteredScores.filter(s => s.playerId === p.id);
      const scoresByDay = pScores.reduce((acc, s) => {
        const day = new Date(s.date).toLocaleDateString();
        if (!acc[day]) acc[day] = { sum: 0, count: 0, timestamp: new Date(s.date).getTime() };
        acc[day].sum += s.score;
        acc[day].count += 1;
        return acc;
      }, {});

      const dailyHistory = Object.keys(scoresByDay).map(day => ({
        date: scoresByDay[day].timestamp,
        score: Math.round(scoresByDay[day].sum / scoresByDay[day].count),
        dateStr: day,
      })).sort((a, b) => a.date - b.date);

      const total = pScores.reduce((a, b) => a + b.score, 0);
      const avg = pScores.length ? Math.round(total / pScores.length) : 0;

      return { ...p, total, avg, history: dailyHistory, rawCount: pScores.length };
    }).sort((a, b) => b.avg - a.avg);
  }, [players, filteredScores]);

  const allHistoryPoints = stats.flatMap(p => p.history);
  const minDate = allHistoryPoints.length ? Math.min(...allHistoryPoints.map(h => h.date)) : Date.now() - 86400000;
  const maxDate = allHistoryPoints.length ? Math.max(...allHistoryPoints.map(h => h.date)) : Date.now();
  const dateRange = maxDate - minDate || 1;

  const uniqueDates = [...new Set(allHistoryPoints.map(h => h.dateStr))].sort((a, b) => {
    const [d1, m1, y1] = a.split('/');
    const [d2, m2, y2] = b.split('/');
    return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
  });

  // Ne garde que les labels suffisamment espacés pour éviter les chevauchements
  const visibleDateLabels = uniqueDates.reduce((acc, dateStr) => {
    const [d, m, y] = dateStr.split('/');
    const timestamp = new Date(y, m - 1, d).getTime();
    const x = PAD_X + ((timestamp - minDate) / dateRange) * (GRAPH_W - 2 * PAD_X);
    if (acc.length === 0 || x - acc[acc.length - 1].x >= MIN_LABEL_SPACING) {
      acc.push({ dateStr, x });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp size={16} className="text-cyan-500" /> Évolution
          </h2>
          <div className="flex gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-700/50">
            {PERIODS.map(opt => (
              <button
                key={opt.val}
                onClick={() => setPeriod(opt.val)}
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  period === opt.val ? 'bg-cyan-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {stats.map(p => (
            <div key={p.id} className="flex items-center gap-1 bg-slate-900/50 px-2 py-0.5 rounded text-[9px] text-slate-400 border border-slate-700/50">
              <div className={`w-1.5 h-1.5 rounded-full ${tailwindColorMap[p.color]}`}></div>
              {p.name}
            </div>
          ))}
        </div>

        <svg viewBox={`0 0 ${GRAPH_W} ${GRAPH_H}`} className="w-full h-auto overflow-visible">
          <line x1={PAD_X} y1={GRAPH_H - PAD_Y} x2={GRAPH_W - PAD_X} y2={GRAPH_H - PAD_Y} stroke="#334155" />
          {[0, 150, 300].map(val => {
            const y = GRAPH_H - PAD_Y - (val / 300) * (GRAPH_H - 2 * PAD_Y);
            return (
              <g key={val}>
                <text x={PAD_X - 12} y={y + 4} textAnchor="end" className="text-[10px] fill-slate-500 font-mono">{val}</text>
                <line x1={PAD_X} y1={y} x2={GRAPH_W - PAD_X} y2={y} stroke="#1e293b" strokeDasharray="4" />
              </g>
            );
          })}
          {visibleDateLabels.map(({ dateStr, x }) => (
            <text key={dateStr} x={x} y={GRAPH_H - PAD_Y + 20} textAnchor="middle" className="text-[9px] fill-slate-500">
              {dateStr.split('/').slice(0, 2).join('/')}
            </text>
          ))}
          {stats.map(p => {
            if (p.history.length < 1) return null;
            const pts = p.history.map(s => ({
              x: PAD_X + ((s.date - minDate) / dateRange) * (GRAPH_W - 2 * PAD_X),
              y: GRAPH_H - PAD_Y - (s.score / 300) * (GRAPH_H - 2 * PAD_Y),
              score: s.score,
              dateStr: s.dateStr,
            }));
            const strokeColor = p.color === 'emerald' ? '#10b981' : p.color === 'yellow' ? '#facc15' : p.color === 'pink' ? '#ec4899' : p.color;
            if (pts.length === 1) return (
              <circle key={p.id} cx={pts[0].x} cy={pts[0].y} r="4" fill={strokeColor}>
                <title>{p.name}: {pts[0].score} pts ({pts[0].dateStr})</title>
              </circle>
            );
            let d = `M ${pts[0].x},${pts[0].y}`;
            for (let i = 0; i < pts.length - 1; i++) {
              const cpW = (pts[i + 1].x - pts[i].x) / 2;
              d += ` C ${pts[i].x + cpW},${pts[i].y} ${pts[i + 1].x - cpW},${pts[i + 1].y} ${pts[i + 1].x},${pts[i + 1].y}`;
            }
            return (
              <g key={p.id}>
                <path d={d} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" className="opacity-70" />
                {pts.map((pt, i) => (
                  <circle key={i} cx={pt.x} cy={pt.y} r="3.5" fill={strokeColor} className="stroke-slate-900 cursor-help">
                    <title>{p.name}: {pt.score} pts ({pt.dateStr})</title>
                  </circle>
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="grid gap-3">
        {stats.map((p, i) => (
          <div
            key={p.id}
            onClick={() => onSelectPlayer(p)}
            className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex justify-between items-center cursor-pointer hover:bg-slate-700/50 transition-all active:scale-95 shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="text-slate-600 font-mono font-bold">#{i + 1}</span>
              <span className="text-2xl bg-slate-900 p-2 rounded-lg">{p.emoji}</span>
              <div>
                <h3 className="font-bold">{p.name}</h3>
                <p className="text-[10px] text-slate-500 uppercase">{p.rawCount} partie{p.rawCount > 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-cyan-400">{p.avg}<span className="text-[10px] ml-1 font-normal text-slate-500 tracking-tighter uppercase">moy</span></p>
              <p className="text-xs text-slate-500 tracking-tight">Total: {p.total}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Clock size={14} /> {period === 'global' ? 'Historique Global' : 'Historique — 3 derniers mois'}
        </h2>
        <div className="space-y-2">
          {filteredScores.slice(0, 10).map(s => {
            const player = players.find(p => p.id === s.playerId);
            return (
              <div key={s.id} className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <span className="text-lg opacity-50">{player?.emoji}</span>
                  <div>
                    <p className="text-xs font-bold text-slate-300">{player?.name}</p>
                    <p className="text-[9px] text-slate-600">
                      {new Date(s.date).toLocaleDateString()} {new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-slate-400">{s.score}</span>
                  <button
                    onClick={e => { e.stopPropagation(); onDeleteScore(s.id); }}
                    className="text-slate-700 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
