import { useMemo } from 'react';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { colorHexMap } from '../constants';

export default function PlayerStats({ player, scores, onBack, onDeleteScore }) {
  const pScores = useMemo(() =>
    scores.filter(s => s.playerId === player.id)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
  , [player.id, scores]);

  const stats = useMemo(() => {
    if (pScores.length === 0) return { max: 0, min: 0, avg: 0, topIds: [] };
    const vals = pScores.map(s => s.score);
    const topIds = [...pScores].sort((a, b) => b.score - a.score).slice(0, 3).map(s => s.id);
    return {
      max: Math.max(...vals),
      min: Math.min(...vals),
      avg: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
      topIds,
    };
  }, [pScores]);

  const barColorHex = colorHexMap[player.color] || '#64748b';

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300 pb-10">
      <button onClick={onBack} className="text-cyan-500 text-[10px] font-black flex items-center gap-1 uppercase hover:underline">
        <ChevronLeft size={14} /> Retour au classement
      </button>

      <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 flex items-center gap-4 shadow-xl">
        <span className="text-5xl bg-slate-900 p-3 rounded-2xl shadow-inner">{player.emoji}</span>
        <div>
          <h2 className="text-2xl font-black tracking-tight leading-tight">{player.name}</h2>
          <div className="h-1.5 w-12 rounded-full mt-2" style={{ backgroundColor: barColorHex }}></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { lab: 'Record',  val: stats.max, col: 'text-emerald-400' },
          { lab: 'Moyenne', val: stats.avg, col: 'text-cyan-400' },
          { lab: 'Min',     val: stats.min, col: 'text-rose-400' },
        ].map(c => (
          <div key={c.lab} className="bg-slate-800 py-4 rounded-2xl border border-slate-700 text-center shadow-lg">
            <p className="text-[8px] font-black text-slate-500 uppercase mb-1">{c.lab}</p>
            <p className={`text-xl font-black ${c.col}`}>{c.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl h-60 flex flex-col">
        <h3 className="text-[9px] font-black text-slate-500 uppercase mb-4 tracking-widest text-center">Progression (15 dernières)</h3>
        <div className="h-36 flex items-end justify-center gap-1.5 px-2 mt-auto">
          {pScores.length > 0 ? (
            pScores.slice(0, 15).reverse().map((s, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                <div className="absolute -top-7 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">{s.score}</div>
                <div
                  className="w-full min-w-[6px] rounded-t-sm transition-all duration-500 opacity-70 group-hover:opacity-100"
                  style={{ height: `${Math.max((s.score / 300) * 100, 5)}%`, backgroundColor: barColorHex }}
                ></div>
              </div>
            ))
          ) : (
            <div className="h-full flex items-center text-slate-600 text-[10px] italic">Aucune donnée</div>
          )}
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl h-[450px] flex flex-col overflow-hidden">
        <h3 className="text-[9px] font-black text-slate-500 uppercase mb-4 tracking-widest">Historique complet</h3>
        <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
          {pScores.map(s => {
            const medalIndex = stats.topIds.indexOf(s.id);
            return (
              <div key={s.id} className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className="w-6 flex justify-center text-xl">
                    {medalIndex === 0 ? '🥇' : medalIndex === 1 ? '🥈' : medalIndex === 2 ? '🥉' : ''}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-xl text-slate-100 leading-none">
                      {s.score} <span className="text-[10px] font-normal text-slate-500 uppercase tracking-tighter">pts</span>
                    </span>
                    <span className="text-[9px] text-slate-500 mt-1.5 font-bold uppercase">
                      {new Date(s.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteScore(s.id)}
                  className="text-slate-700 hover:text-rose-500 p-2 transition-colors active:scale-90"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
