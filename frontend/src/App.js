import { useState, useEffect, useCallback } from 'react';
import { Trophy, Activity, PlusCircle, Users } from 'lucide-react';
import Dashboard from './components/Dashboard';
import PlayerStats from './components/PlayerStats';
import AddScore from './components/AddScore';
import Players from './components/Players';
import TabBtn from './components/TabBtn';
import Toast from './components/Toast';

const API = "/api";

export default function App() {
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API}/data`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPlayers(data.players || []);
      setScores(data.scores || []);
    } catch {
      showToast("Impossible de charger les données");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setSelectedPlayer(null); }, [activeTab]);

  const handleAddPlayer = async (name, color, emoji) => {
    try {
      const res = await fetch(`${API}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Date.now().toString(), name, color, emoji }),
      });
      if (!res.ok) throw new Error();
      await fetchData();
      showToast("Joueur ajouté", 'success');
    } catch {
      showToast("Impossible d'ajouter le joueur");
    }
  };

  const handleAddScore = async (newScore) => {
    try {
      const res = await fetch(`${API}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newScore),
      });
      if (!res.ok) throw new Error();
      await fetchData();
      showToast("Score enregistré", 'success');
    } catch {
      showToast("Impossible d'enregistrer le score");
    }
  };

  const handleDeleteScore = async (scoreId) => {
    try {
      const res = await fetch(`${API}/scores/${scoreId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      await fetchData();
    } catch {
      showToast("Impossible de supprimer le score");
    }
  };

  const handleDeletePlayer = async (id) => {
    try {
      const res = await fetch(`${API}/players/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      await fetchData();
    } catch {
      showToast("Impossible de supprimer le joueur");
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans">
      Chargement...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 pb-32 font-sans">
      <div className="max-w-xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
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
        <div className="max-w-xl mx-auto flex justify-around">
          <TabBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<Activity />} label="Stats" />
          <TabBtn active={activeTab === 'add-score'} onClick={() => setActiveTab('add-score')} icon={<PlusCircle />} label="Score" />
          <TabBtn active={activeTab === 'players'} onClick={() => setActiveTab('players')} icon={<Users />} label="Joueurs" />
        </div>
      </nav>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
