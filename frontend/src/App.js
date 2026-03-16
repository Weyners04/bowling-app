import React, { useState, useMemo, useEffect } from 'react';
import { Trophy, Activity, PlusCircle, Users, Trash2, TrendingUp, Clock, ChevronLeft } from 'lucide-react';

const API = "/api";

const tailwindColorMap = {
  'blue': 'bg-blue-500',
  'red': 'bg-red-500',
  'emerald': 'bg-emerald-500',
  'yellow': 'bg-yellow-500',
  'purple': 'bg-purple-500',
  'pink': 'bg-pink-500'
};

export default function App() {
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API}/data`);
      const data = await res.json();
      setPlayers(data.players || []);
      setScores(data.scores || []);
    } catch (err) { console.error("Erreur chargement:", err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddPlayer = async (name, color, emoji) => {
    const newPlayer = { id: Date.now().toString(), name, color, emoji };
    await fetch(`${API}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPlayer)
    });
    fetchData();
  };

  const handleAddScore = async (newScore) => {
    await fetch(`${API}/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newScore)
    });
    fetchData();
  };

  const handleDeleteScore = async (scoreId) => {
    await fetch(`${API}/scores/${scoreId}`, { method: 'DELETE' });
    fetchData();
  };

  const handleDeletePlayer = async (id) => {
    await fetch(`${API}/players/${id}`, { method: 'DELETE' });
    fetchData();
  };

  useEffect(() => { setSelectedPlayer(null); }, [activeTab]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans">Chargement...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 pb-32 font-sans ">
      <div className="max-w-xl mx-auto">
        <header className="mb-6 flex items-center justify-between ">
          <h1 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
            <Trophy className="text-yellow-400" /> StrikeTracker
          </h1>
        </header>

        <main> 
          {activeTab === 'dashboard' && (
            selectedPlayer 
              ? <PlayerStats player={selectedPlayer} scores={scores} onBack={() => setSelectedPlayer(null)} onDeleteScore={handleDeleteScore} />
              : <Dashboard players={players} scores={scores} onSelectPlayer={setSelectedPlayer} onDeleteScore={handleDeleteScore} />
          )}
          {activeTab === 'add-score' && <AddScore players={players} onAddScore={handleAddScore} />}
          {activeTab === 'players' && <Players players={players} onAddPlayer={handleAddPlayer} onDeletePlayer={handleDeletePlayer} />}
        </main>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-md p-4 border-t border-slate-700 z-50">
        <div className=' max-w-xl mx-auto flex justify-around'>

        <TabBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<Activity />} label="Stats" />
        <TabBtn active={activeTab === 'add-score'} onClick={() => setActiveTab('add-score')} icon={<PlusCircle />} label="Score" />
        <TabBtn active={activeTab === 'players'} onClick={() => setActiveTab('players')} icon={<Users />} label="Joueurs" />
        </div>
      </nav>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-cyan-400' : 'text-slate-400'}`}>
      {icon} <span className="text-xs">{label}</span>
    </button>
  );
}

function Dashboard({ players, scores, onSelectPlayer, onDeleteScore }) {
  const stats = useMemo(() => {
    return players.map(p => {
      const pScores = scores.filter(s => s.playerId === p.id);
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
        dateStr: day
      })).sort((a, b) => a.date - b.date);

      const total = pScores.reduce((a, b) => a + b.score, 0);
      const avg = pScores.length ? Math.round(total / pScores.length) : 0;

      return { ...p, total, avg, history: dailyHistory, rawCount: pScores.length };
    }).sort((a, b) => b.avg - a.avg);
  }, [players, scores]);

  const graphWidth = 600;
  const graphHeight = 250;
  const paddingX = 50;
  const paddingY = 50;
  
  const allHistoryPoints = stats.flatMap(p => p.history);
  const minDate = allHistoryPoints.length ? Math.min(...allHistoryPoints.map(h => h.date)) : Date.now() - 86400000;
  const maxDate = allHistoryPoints.length ? Math.max(...allHistoryPoints.map(h => h.date)) : Date.now();
  const dateRange = maxDate - minDate || 1;

  const uniqueDates = [...new Set(allHistoryPoints.map(h => h.dateStr))].sort((a,b) => {
    const [d1, m1, y1] = a.split('/');
    const [d2, m2, y2] = b.split('/');
    return new Date(y1, m1-1, d1) - new Date(y2, m2-1, d2);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp size={16} className="text-cyan-500" /> Évolution
          </h2>
          <div className="flex flex-wrap gap-2">
            {stats.map(p => (
              <div key={p.id} className="flex items-center gap-1 bg-slate-900/50 px-2 py-0.5 rounded text-[9px] text-slate-400 border border-slate-700/50">
                <div className={`w-1.5 h-1.5 rounded-full ${tailwindColorMap[p.color]}`}></div>
                {p.name}
              </div>
            ))}
          </div>
        </div>

        <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-auto overflow-visible">
          <line x1={paddingX} y1={graphHeight - paddingY} x2={graphWidth - paddingX} y2={graphHeight - paddingY} stroke="#334155" />
          {[0, 150, 300].map(val => {
            const y = graphHeight - paddingY - (val / 300) * (graphHeight - 2 * paddingY);
            return (
              <g key={val}>
                <text x={paddingX - 12} y={y + 4} textAnchor="end" className="text-[10px] fill-slate-500 font-mono">{val}</text>
                <line x1={paddingX} y1={y} x2={graphWidth - paddingX} y2={y} stroke="#1e293b" strokeDasharray="4" />
              </g>
            )
          })}
          {uniqueDates.map((dateStr) => {
            const [d, m, y] = dateStr.split('/');
            const timestamp = new Date(y, m-1, d).getTime();
            const x = paddingX + ((timestamp - minDate) / dateRange) * (graphWidth - 2 * paddingX);
            return (
              <g key={dateStr}>
                <text x={x} y={graphHeight - paddingY + 20} textAnchor="middle" className="text-[9px] fill-slate-500">{dateStr.split('/').slice(0, 2).join('/')}</text>
              </g>
            )
          })}
          {stats.map(p => {
            if (p.history.length < 1) return null;
            const pts = p.history.map(s => ({
              x: paddingX + ((s.date - minDate) / dateRange) * (graphWidth - 2 * paddingX),
              y: graphHeight - paddingY - (s.score / 300) * (graphHeight - 2 * paddingY),
              score: s.score,
              dateStr: s.dateStr
            }));
            let strokeColor = p.color === 'emerald' ? '#10b981' : p.color === 'yellow' ? '#facc15' : p.color === 'pink' ? '#ec4899' : p.color;
            if (pts.length === 1) return (
               <circle key={p.id} cx={pts[0].x} cy={pts[0].y} r="4" fill={strokeColor}>
                 <title>{p.name}: {pts[0].score} pts ({pts[0].dateStr})</title>
               </circle>
            );
            let d = `M ${pts[0].x},${pts[0].y}`;
            for (let i = 0; i < pts.length - 1; i++) {
              const cpW = (pts[i+1].x - pts[i].x) / 2;
              d += ` C ${pts[i].x + cpW},${pts[i].y} ${pts[i+1].x - cpW},${pts[i+1].y} ${pts[i+1].x},${pts[i+1].y}`;
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
          <div key={p.id} onClick={() => onSelectPlayer(p)} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex justify-between items-center cursor-pointer hover:bg-slate-700/50 transition-all active:scale-95 shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-slate-600 font-mono font-bold">#{i+1}</span>
              <span className="text-2xl bg-slate-900 p-2 rounded-lg">{p.emoji}</span>
              <div>
                <h3 className="font-bold">{p.name}</h3>
                <p className="text-[10px] text-slate-500 uppercase">{p.rawCount} parties</p>
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
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Clock size={14}/> Historique Global</h2>
        <div className="space-y-2">
          {scores.sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 10).map(s => {
            const player = players.find(p => p.id === s.playerId);
            return (
              <div key={s.id} className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <span className="text-lg opacity-50">{player?.emoji}</span>
                  <div>
                    <p className="text-xs font-bold text-slate-300">{player?.name}</p>
                    <p className="text-[9px] text-slate-600">{new Date(s.date).toLocaleDateString()} {new Date(s.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-slate-400">{s.score}</span>
                  <button onClick={(e) => { e.stopPropagation(); onDeleteScore(s.id); }} className="text-slate-700 hover:text-rose-500 transition-colors"><Trash2 size={14}/></button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}

function PlayerStats({ player, scores, onBack, onDeleteScore }) {
  const pScores = useMemo(() => 
    scores.filter(s => s.playerId === player.id)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
  , [player.id, scores]);

  const stats = useMemo(() => {
    if (pScores.length === 0) return { max: 0, min: 0, avg: 0, topIds: [] };
    const vals = pScores.map(s => s.score);
    const sortedForMedals = [...pScores].sort((a, b) => b.score - a.score);
    const topIds = sortedForMedals.slice(0, 3).map(s => s.id);
    return { max: Math.max(...vals), min: Math.min(...vals), avg: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length), topIds };
  }, [pScores]);

  const barColorHex = useMemo(() => {
    const colorMap = { 'blue': '#3b82f6', 'red': '#ef4444', 'emerald': '#10b981', 'yellow': '#facc15', 'purple': '#a855f7', 'pink': '#ec4899' };
    return colorMap[player.color] || '#64748b';
  }, [player.color]);

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300 pb-10">
      <button onClick={onBack} className="text-cyan-500 text-[10px] font-black flex items-center gap-1 uppercase hover:underline">
        <ChevronLeft size={14}/> Retour au classement
      </button>

      <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 flex items-center gap-4 shadow-xl">
        <span className="text-5xl bg-slate-900 p-3 rounded-2xl shadow-inner">{player.emoji}</span>
        <div>
          <h2 className="text-2xl font-black tracking-tight leading-tight">{player.name}</h2>
          <div className="h-1.5 w-12 rounded-full mt-2" style={{ backgroundColor: barColorHex }}></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[ {lab: 'Record', val: stats.max, col: 'text-emerald-400'}, {lab: 'Moyenne', val: stats.avg, col: 'text-cyan-400'}, {lab: 'Min', val: stats.min, col: 'text-rose-400'} ].map(c => (
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
                <div className="w-full min-w-[6px] rounded-t-sm transition-all duration-500 opacity-70 group-hover:opacity-100" style={{ height: `${Math.max((s.score / 300) * 100, 5)}%`, backgroundColor: barColorHex }}></div>
              </div>
            ))
          ) : <div className="h-full flex items-center text-slate-600 text-[10px] italic">Aucune donnée</div>}
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl h-[450px] flex flex-col overflow-hidden">
        <h3 className="text-[9px] font-black text-slate-500 uppercase mb-4 tracking-widest">Historique complet</h3>
        <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
          {pScores.map((s) => {
            const medalIndex = stats.topIds.indexOf(s.id);
            return (
              <div key={s.id} className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 flex justify-between items-center group">
                 <div className="flex items-center gap-4">
                   <div className="w-6 flex justify-center text-xl">
                     {medalIndex === 0 ? '🥇' : medalIndex === 1 ? '🥈' : medalIndex === 2 ? '🥉' : ''}
                   </div>
                   <div className="flex flex-col">
                     <span className="font-black text-xl text-slate-100 leading-none">{s.score} <span className="text-[10px] font-normal text-slate-500 uppercase tracking-tighter">pts</span></span>
                     <span className="text-[9px] text-slate-500 mt-1.5 font-bold uppercase">{new Date(s.date).toLocaleDateString('fr-FR')}</span>
                   </div>
                 </div>
                 <button onClick={() => onDeleteScore(s.id)} className="text-slate-700 hover:text-rose-500 p-2 transition-colors active:scale-90"><Trash2 size={16} /></button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AddScore({ players, onAddScore }) {
  const [pId, setPId] = useState('');
  const [val, setVal] = useState('');
  const [isToday, setIsToday] = useState(true);
  const [mDate, setMDate] = useState(new Date().toISOString().split('T')[0]);
  const [mTime, setMTime] = useState(new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:false}));

  const submit = (e) => {
    e.preventDefault();
    if (!pId || !val) return;
    let finalDate = isToday ? new Date().toISOString() : new Date(`${mDate}T${mTime}:00`).toISOString();
    onAddScore({ id: Date.now().toString(), playerId: pId, score: parseInt(val), date: finalDate });
    setVal('');
  };

  return (
    <form onSubmit={submit} className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-300 max-w-md mx-auto">
      <h2 className="text-xl font-black text-cyan-400 mb-2">Nouvelle Partie</h2>
      <select value={pId} onChange={e => setPId(e.target.value)} className="w-full p-4 bg-slate-900 rounded-2xl border border-slate-700 outline-none focus:ring-2 ring-cyan-500 text-white appearance-none">
        <option value="">Sélectionner un joueur</option>
        {players.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
      </select>
      <input type="number" value={val} onChange={e => setVal(e.target.value)} placeholder="Score (0-300)" className="w-full p-4 bg-slate-900 rounded-2xl border border-slate-700 outline-none text-white text-xl font-bold" />
      <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl cursor-pointer" onClick={() => setIsToday(!isToday)}>
        <input type="checkbox" checked={isToday} readOnly className="w-5 h-5 accent-cyan-500 rounded" />
        <label className="text-sm text-slate-400 font-bold uppercase tracking-tighter">Joué à l'instant</label>
      </div>
      {!isToday && (
        <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 duration-300">
          <input type="date" value={mDate} onChange={e => setMDate(e.target.value)} className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-sm text-white outline-none" />
          <input type="time" value={mTime} onChange={e => setMTime(e.target.value)} className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-sm text-white outline-none" />
        </div>
      )}
      <button className="w-full bg-cyan-600 hover:bg-cyan-500 p-4 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all mt-4 uppercase tracking-widest">Enregistrer</button>
    </form>
  );
}

function Players({ players, onAddPlayer, onDeletePlayer }) {
  const [n, setN] = useState('');
  const [em, setEm] = useState('👤');
  const [col, setCol] = useState('blue');
  const emojis = ['👤', '🐱', '🦁', '🤖', '⭐', '🔥', '👑', '⚡', '🎳'];
  const colors = [{ n: 'Bleu', c: 'blue' }, { n: 'Rouge', c: 'red' }, { n: 'Vert', c: 'emerald' }, { n: 'Jaune', c: 'yellow' }, { n: 'Violet', c: 'purple' }, { n: 'Rose', c: 'pink' }];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-md mx-auto">
      <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
        <h2 className="text-xl font-black mb-6 uppercase tracking-tight">Nouveau Profil</h2>
        <div className="space-y-6">
          <input value={n} onChange={e => setN(e.target.value)} placeholder="Prénom" className="w-full p-4 bg-slate-900 rounded-2xl border border-slate-700 outline-none text-white font-bold" />
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase mb-3">Emoji</p>
            <div className="flex flex-wrap gap-2">
              {emojis.map(e => <button key={e} type="button" onClick={() => setEm(e)} className={`text-xl p-3 rounded-xl transition-all ${em === e ? 'bg-cyan-500 scale-110 shadow-lg' : 'bg-slate-900 hover:bg-slate-700'}`}>{e}</button>)}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase mb-3">Couleur</p>
            <div className="flex flex-wrap gap-3">
              {colors.map(c => (
                <button key={c.c} type="button" onClick={() => setCol(c.c)} className={`w-10 h-10 rounded-full border-4 transition-all ${col === c.c ? 'border-white scale-110 shadow-lg' : 'border-transparent'} ${tailwindColorMap[c.c]}`}></button>
              ))}
            </div>
          </div>
          <button type="button" onClick={() => { if(n) { onAddPlayer(n, col, em); setN(''); } }} className="w-full bg-emerald-600 hover:bg-emerald-500 p-4 rounded-2xl font-black uppercase shadow-lg transition-all tracking-widest">Créer</button>
        </div>
      </div>
      <div className="grid gap-2">
        {players.map(p => (
          <div key={p.id} className="flex justify-between items-center bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-2xl bg-slate-900 p-2 rounded-xl">{p.emoji}</span>
              <span className="font-black text-lg">{p.name}</span>
              <div className={`w-3 h-3 rounded-full ${tailwindColorMap[p.color]}`}></div>
            </div>
            <button onClick={() => onDeletePlayer(p.id)} className="text-slate-700 hover:text-rose-500 p-2 transition-colors"><Trash2 size={20} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}