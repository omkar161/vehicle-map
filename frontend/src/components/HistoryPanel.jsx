import { ChevronDown, Play, Pause, RotateCcw, X } from "lucide-react";

export default function HistoryPanel({ 
  selectedPeriod, 
  onPeriodChange, 
  isPlaying, 
  onToggle, 
  onReset, 
  speed, 
  onSpeedChange,
  currentIndex,
  totalPoints,
  onSeek,
  onExit
}) {
  const periods = ["Today", "Yesterday", "This Week", "Previous Week", "This Month", "Previous Month", "Custom"];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t border-gray-300 p-4 z-[2000]">
      <div className="flex items-center justify-between gap-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => onPeriodChange(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {periods.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onToggle} className={`p-2.5 rounded-full ${isPlaying ? "bg-red-500" : "bg-blue-500"} text-white`}>
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button onClick={onReset} className="p-2.5 bg-gray-200 rounded-full hover:bg-gray-300">
            <RotateCcw size={20} />
          </button>
          <div className="flex gap-1">
            {[0.5, 1, 2, 5].map(s => (
              <button key={s} onClick={() => onSpeedChange(s)} className={`px-2.5 py-1 text-xs font-bold rounded ${speed === s ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
                {s}x
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 mx-4">
          <input
            type="range"
            min="0"
            max={totalPoints - 1}
            value={currentIndex}
            onChange={(e) => onSeek(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, #10b981 0%, #10b981 ${(currentIndex/(totalPoints-1))*100}%, #e5e7eb ${(currentIndex/(totalPoints-1))*100}%, #e5e7eb 100%)` }}
          />
        </div>

        <button onClick={onExit} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
