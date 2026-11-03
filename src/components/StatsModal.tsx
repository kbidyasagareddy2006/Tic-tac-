import React, { useState } from 'react';
import { GameStats } from '../types/game';
import { X, Trophy, Flame, RotateCcw, AlertTriangle } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface StatsModalProps {
  isOpen: boolean;
  stats: GameStats;
  player1Name: string;
  player2Name: string;
  onResetStats: () => void;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  stats,
  player1Name,
  player2Name,
  onResetStats,
  onClose,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen) return null;

  const total = stats.totalMatches;
  const p1Wins = stats.player1Wins;
  const p2Wins = stats.player2Wins;
  const draws = stats.draws;

  const winRate = total > 0 ? Math.round((p1Wins / total) * 100) : 0;
  const p1Percent = total > 0 ? Math.round((p1Wins / total) * 100) : 0;
  const p2Percent = total > 0 ? Math.round((p2Wins / total) * 100) : 0;
  const drawsPercent = total > 0 ? Math.max(0, 100 - p1Percent - p2Percent) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">Match Records</h3>
              <p className="text-xs text-slate-400">Lifetime career stats & streak tracking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close statistics"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlight Cards */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 text-center">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">
              Matches
            </div>
            <div className="text-2xl font-black font-mono text-white tabular-nums">
              {total}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-cyan-500/20 rounded-2xl p-3 text-center">
            <div className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 mb-0.5">
              Win Rate
            </div>
            <div className="text-2xl font-black font-mono text-cyan-400 tabular-nums">
              {winRate}%
            </div>
          </div>

          <div className="bg-slate-950/60 border border-amber-500/20 rounded-2xl p-3 text-center">
            <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400 mb-0.5 flex items-center justify-center gap-1">
              <Flame className="w-3 h-3 fill-amber-400" />
              <span>Streak</span>
            </div>
            <div className="text-2xl font-black font-mono text-amber-300 tabular-nums">
              {stats.currentStreak}
            </div>
            <div className="text-[9px] text-slate-400">Best: {stats.bestStreak}</div>
          </div>
        </div>

        {/* Visual Record Bar */}
        <div className="mb-5 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-cyan-400">{player1Name}: {p1Wins}</span>
            <span className="text-slate-400">Ties: {draws}</span>
            <span className="text-purple-400">{player2Name}: {p2Wins}</span>
          </div>

          {/* Progress bar split */}
          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${total > 0 ? (p1Wins / total) * 100 : 33.3}%` }}
              className="bg-cyan-500 transition-all duration-500"
              title={`${player1Name} wins: ${p1Wins}`}
            />
            <div
              style={{ width: `${total > 0 ? (draws / total) * 100 : 33.3}%` }}
              className="bg-slate-500 transition-all duration-500"
              title={`Draws: ${draws}`}
            />
            <div
              style={{ width: `${total > 0 ? (p2Wins / total) * 100 : 33.3}%` }}
              className="bg-purple-500 transition-all duration-500"
              title={`${player2Name} wins: ${p2Wins}`}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1.5 tabular-nums">
            <span>{p1Percent}%</span>
            <span>{drawsPercent}%</span>
            <span>{p2Percent}%</span>
          </div>
        </div>

        {/* Match History */}
        <div className="mb-5">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Recent Match Log
          </div>
          {stats.history.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800/60">
              No completed matches recorded yet. Play a round!
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {stats.history.slice(0, 10).map((record) => {
                const isDraw = record.winner === 'draw';
                const isP1 = record.winner === 'player1';

                return (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isDraw
                            ? 'bg-slate-400'
                            : isP1
                            ? 'bg-cyan-400 shadow-sm shadow-cyan-400/50'
                            : 'bg-purple-400 shadow-sm shadow-purple-400/50'
                        }`}
                      />
                      <span className="font-semibold text-slate-200">
                        {isDraw ? 'Draw' : `${record.winnerName} Won`}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        · {record.mode === 'AI' ? `${record.difficulty} AI` : 'PVP'}
                      </span>
                    </div>

                    <div className="text-slate-400 text-[11px] tabular-nums font-mono">
                      {record.movesCount} moves
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with Reset confirmation */}
        <div className="pt-3 border-t border-slate-800">
          {!showConfirmReset ? (
            <button
              onClick={() => {
                soundFx.playClick();
                setShowConfirmReset(true);
              }}
              className="text-xs text-rose-400/80 hover:text-rose-400 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Lifetime History</span>
            </button>
          ) : (
            <div className="p-3 bg-rose-950/30 border border-rose-900/50 rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-rose-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Confirm wiping all stats?</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-2.5 py-1 text-xs text-slate-300 hover:text-white rounded bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onResetStats();
                    setShowConfirmReset(false);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold text-white rounded bg-rose-600 hover:bg-rose-500 shadow-sm"
                >
                  Yes, Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
