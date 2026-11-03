import React, { useState } from 'react';
import { GameSettings, GameMode, AIDifficulty, PlayerSymbol, StartingPlayer } from '../types/game';
import { X, Check, Volume2, VolumeX, Shield, Swords, Cpu } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface SettingsModalProps {
  isOpen: boolean;
  settings: GameSettings;
  onSave: (newSettings: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onSave,
  onClose,
}) => {
  const [draft, setDraft] = useState<GameSettings>({ ...settings });

  if (!isOpen) return null;

  const handleApply = () => {
    soundFx.playClick();
    onSave(draft);
    onClose();
  };

  const handleResetDefaults = () => {
    soundFx.playClick();
    setDraft({
      mode: 'AI',
      difficulty: 'hard',
      userSymbol: 'X',
      startingPlayer: 'user',
      soundEnabled: true,
      player1Name: 'Player 1',
      player2Name: 'Cyber AI',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">Game Settings</h3>
              <p className="text-xs text-slate-400">Configure modes, symbols and AI rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* 1. Game Mode */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Game Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setDraft((prev) => ({
                    ...prev,
                    mode: 'AI',
                    player2Name: prev.player2Name === 'Player 2' ? 'Cyber AI' : prev.player2Name,
                  }));
                }}
                className={`py-3 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  draft.mode === 'AI'
                    ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 box-glow-cyan'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>VS Computer</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setDraft((prev) => ({
                    ...prev,
                    mode: 'PVP',
                    player2Name: prev.player2Name === 'Cyber AI' ? 'Player 2' : prev.player2Name,
                  }));
                }}
                className={`py-3 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  draft.mode === 'PVP'
                    ? 'bg-purple-950/60 border-purple-400 text-purple-300 box-glow-purple'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Swords className="w-4 h-4" />
                <span>2 Players Local</span>
              </button>
            </div>
          </div>

          {/* 2. AI Difficulty (if AI mode) */}
          {draft.mode === 'AI' && (
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                AI Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((level) => {
                  const isActive = draft.difficulty === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setDraft((prev) => ({ ...prev, difficulty: level }));
                      }}
                      className={`py-2.5 px-2 rounded-xl border text-xs font-bold capitalize transition-all ${
                        isActive
                          ? level === 'hard'
                            ? 'bg-rose-950/60 border-rose-500 text-rose-300 shadow-lg shadow-rose-950/50'
                            : level === 'medium'
                            ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-lg shadow-amber-950/50'
                            : 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-950/50'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <span>{level === 'hard' ? 'Unbeatable' : level}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                {draft.difficulty === 'hard'
                  ? 'Minimax AI algorithm calculates all branches. Perfect play.'
                  : draft.difficulty === 'medium'
                  ? 'Strategic bot. Takes wins, blocks opponent, controls center.'
                  : 'Casual bot. Makes randomized moves for relaxed play.'}
              </p>
            </div>
          )}

          {/* 3. Player Symbol Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Your Symbol (Player 1)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setDraft((prev) => ({ ...prev, userSymbol: 'X' }));
                }}
                className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-3 transition-all ${
                  draft.userSymbol === 'X'
                    ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 box-glow-cyan'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="font-extrabold text-xl text-cyan-400 glow-cyan">X</span>
                <span className="text-xs font-medium">Neon Cyan</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setDraft((prev) => ({ ...prev, userSymbol: 'O' }));
                }}
                className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-3 transition-all ${
                  draft.userSymbol === 'O'
                    ? 'bg-purple-950/60 border-purple-400 text-purple-300 box-glow-purple'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="font-extrabold text-xl text-purple-400 glow-purple">O</span>
                <span className="text-xs font-medium">Electric Purple</span>
              </button>
            </div>
          </div>

          {/* 4. Starting Player */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Who Plays First?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'user', label: 'You (P1)' },
                { id: 'opponent', label: draft.mode === 'AI' ? 'Computer' : 'P2' },
                { id: 'alternate', label: 'Alternate' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setDraft((prev) => ({ ...prev, startingPlayer: item.id as StartingPlayer }));
                  }}
                  className={`py-2 px-2 rounded-xl border text-xs font-medium transition-all ${
                    draft.startingPlayer === item.id
                      ? 'bg-cyan-950/70 border-cyan-400 text-cyan-300 shadow-md'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Custom Names */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Player 1 Name
              </label>
              <input
                type="text"
                value={draft.player1Name}
                maxLength={14}
                onChange={(e) => setDraft((prev) => ({ ...prev, player1Name: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                placeholder="Player 1"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                {draft.mode === 'AI' ? 'AI Bot Name' : 'Player 2 Name'}
              </label>
              <input
                type="text"
                value={draft.player2Name}
                maxLength={14}
                onChange={(e) => setDraft((prev) => ({ ...prev, player2Name: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-400"
                placeholder={draft.mode === 'AI' ? 'Cyber AI' : 'Player 2'}
              />
            </div>
          </div>

          {/* 6. Sound Effects Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800">
            <div className="flex items-center gap-2.5">
              {draft.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
              <div>
                <div className="text-xs font-semibold text-slate-200">Synthesized Audio FX</div>
                <div className="text-[11px] text-slate-400">Web Audio API move chimes & fanfares</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const nextState = !draft.soundEnabled;
                setDraft((prev) => ({ ...prev, soundEnabled: nextState }));
                if (nextState) soundFx.playClick();
              }}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                draft.soundEnabled ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  draft.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Reset Defaults
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-3 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="py-2 px-4 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-md shadow-cyan-950/50 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Apply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
