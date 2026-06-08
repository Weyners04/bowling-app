export default function TabBtn({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-cyan-400' : 'text-slate-400'}`}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  );
}
