import React from 'react';
import { Volume2, VolumeX, BarChart2, Settings, RotateCcw } from 'lucide-react';
import { GameMode, AIDifficulty } from '../types/game';

interface HeaderProps {
  mode: GameMode;
  difficulty: AIDifficulty;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onRestartGame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  difficulty,
  soundEnabled,
  onToggleSound,
  onOpenStats,
  onOpenSettings,
  onRestartGame,
}) => {
  return (
    <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-slate-900 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-950/40">
            <span className="font-extrabold text-base bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              #
            </span>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-wider text-slate-100 flex items-center gap-2">
              CYBER TACTIX
            </h1>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 -mt-0.5">
              <span>{mode === 'AI' ? 'VS COMPUTER' : '2 PLAYERS'}</span>
              {mode === 'AI' && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="text-cyan-400 capitalize">{difficulty}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Restart Round Button */}
          <button
            onClick={onRestartGame}
            title="Restart Board"
            className="p-2 sm:px-3 sm:py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-lg transition-all flex items-center gap-1.5 active:scale-95"
            aria-label="Restart round"
          >
            <RotateCcw className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Audio Toggle Button */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            className={`p-2 rounded-lg border transition-all active:scale-95 ${
              soundEnabled
                ? 'bg-slate-900 text-cyan-400 border-cyan-500/30 hover:border-cyan-400/50'
                : 'bg-slate-900/60 text-slate-500 border-slate-800 hover:text-slate-400'
            }`}
            aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Stats Button */}
          <button
            onClick={onOpenStats}
            title="Match Statistics"
            className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all active:scale-95"
            aria-label="Open statistics"
          >
            <BarChart2 className="w-4 h-4" />
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            title="Game Settings"
            className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all active:scale-95"
            aria-label="Open settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
