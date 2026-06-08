import { useState } from 'react';

function nowTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export default function AddScore({ players, onAddScore }) {
  const [pId, setPId] = useState('');
  const [val, setVal] = useState('');
  const [isToday, setIsToday] = useState(true);
  const [mDate, setMDate] = useState(todayStr);
  const [mTime, setMTime] = useState(nowTime);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateError, setDateError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!pId || !val) return;
    const scoreNum = parseInt(val, 10);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 300) return;

    const finalDate = isToday
      ? new Date().toISOString()
      : new Date(`${mDate}T${mTime}:00`).toISOString();

    if (!isToday && new Date(finalDate) > new Date()) {
      setDateError("La date ne peut pas être dans le futur");
      return;
    }
    setDateError('');

    setIsSubmitting(true);
    await onAddScore({ id: Date.now().toString(), playerId: pId, score: scoreNum, date: finalDate });
    setVal('');
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={submit} className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-300 max-w-md mx-auto">
      <h2 className="text-xl font-black text-cyan-400 mb-2">Nouvelle Partie</h2>
      <select
        value={pId}
        onChange={e => setPId(e.target.value)}
        className="w-full p-4 bg-slate-900 rounded-2xl border border-slate-700 outline-none focus:ring-2 ring-cyan-500 text-white appearance-none"
      >
        <option value="">Sélectionner un joueur</option>
        {players.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
      </select>
      <input
        type="number"
        value={val}
        onChange={e => setVal(e.target.value)}
        placeholder="Score (0-300)"
        min="0"
        max="300"
        className="w-full p-4 bg-slate-900 rounded-2xl border border-slate-700 outline-none text-white text-xl font-bold"
      />
      <div
        className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl cursor-pointer"
        onClick={() => { setIsToday(!isToday); setDateError(''); }}
      >
        <input type="checkbox" checked={isToday} readOnly className="w-5 h-5 accent-cyan-500 rounded" />
        <label className="text-sm text-slate-400 font-bold uppercase tracking-tighter">Joué à l'instant</label>
      </div>
      {!isToday && (
        <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={mDate}
              max={todayStr()}
              onChange={e => { setMDate(e.target.value); setDateError(''); }}
              className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-sm text-white outline-none"
            />
            <input
              type="time"
              value={mTime}
              onChange={e => { setMTime(e.target.value); setDateError(''); }}
              className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-sm text-white outline-none"
            />
          </div>
          {dateError && (
            <p className="text-rose-400 text-xs font-bold px-1">{dateError}</p>
          )}
        </div>
      )}
      <button
        disabled={isSubmitting || !pId || !val}
        className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed p-4 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all mt-4 uppercase tracking-widest"
      >
        {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </form>
  );
}
