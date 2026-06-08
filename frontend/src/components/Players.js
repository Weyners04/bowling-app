import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { tailwindColorMap, EMOJIS, COLORS } from '../constants';

export default function Players({ players, onAddPlayer, onDeletePlayer }) {
  const [n, setN] = useState('');
  const [em, setEm] = useState('👤');
  const [col, setCol] = useState('blue');

  const handleCreate = () => {
    if (!n.trim()) return;
    onAddPlayer(n.trim(), col, em);
    setN('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-md mx-auto">
      <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
        <h2 className="text-xl font-black mb-6 uppercase tracking-tight">Nouveau Profil</h2>
        <div className="space-y-6">
          <input
            value={n}
            onChange={e => setN(e.target.value)}
            placeholder="Prénom"
            maxLength={50}
            className="w-full p-4 bg-slate-900 rounded-2xl border border-slate-700 outline-none text-white font-bold"
          />
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase mb-3">Emoji</p>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(e => (
                <button key={e} type="button" onClick={() => setEm(e)} className={`text-xl p-3 rounded-xl transition-all ${em === e ? 'bg-cyan-500 scale-110 shadow-lg' : 'bg-slate-900 hover:bg-slate-700'}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase mb-3">Couleur</p>
            <div className="flex flex-wrap gap-3">
              {COLORS.map(c => (
                <button
                  key={c.c}
                  type="button"
                  onClick={() => setCol(c.c)}
                  className={`w-10 h-10 rounded-full border-4 transition-all ${col === c.c ? 'border-white scale-110 shadow-lg' : 'border-transparent'} ${tailwindColorMap[c.c]}`}
                />
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!n.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed p-4 rounded-2xl font-black uppercase shadow-lg transition-all tracking-widest"
          >
            Créer
          </button>
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
            <button onClick={() => onDeletePlayer(p.id)} className="text-slate-700 hover:text-rose-500 p-2 transition-colors">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
