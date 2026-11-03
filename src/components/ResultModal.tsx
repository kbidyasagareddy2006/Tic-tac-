import React from 'react';
import { PlayerSymbol, GameMode, AIDifficulty } from '../types/game';
import { Trophy, RefreshCw, Eye, ArrowRight, Flame } from 'lucide-react';

interface ResultModalProps {
  isOpen: boolean;
  status: 'won' | 'draw';
  winnerSymbol: PlayerSymbol | null;
  winnerName: string;
  isUserWinner: boolean;
  mode: GameMode;
  difficulty: AIDifficulty;
  currentStreak: number;
  onNextRound: () => void;
  onRestartSeries: () => void;
  onReviewBoard: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  status,
  winnerSymbol,
  winnerName,
  isUserWinner,
  mode,
  difficulty,
  currentStreak,
  onNextRound,
  onRestartSeries,
  onReviewBoard,
}) => {
  if (!isOpen) return null;

  const isDraw = status === 'draw';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-7 shadow-2xl relative overflow-hidden flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
        {/* Top ambient colored aura */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
            isDraw
              ? 'bg-slate-500/20'
              : isUserWinner || mode === 'PVP'
              ? 'bg-cyan-500/30'
              : 'bg-rose-500/25'
          }`}
        />

        {/* Icon & Trophy */}
        <div className="relative mb-3 mt-1">
          {isDraw ? (
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shadow-lg">
              <span className="text-2xl font-black font-mono">VS</span>
            </div>
          ) : (
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-xl ${
                winnerSymbol === 'X'
                  ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-400 box-glow-cyan'
                  : 'bg-purple-950/80 border-purple-500/50 text-purple-400 box-glow-purple'
              }`}
            >
              <Trophy className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Headline */}
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
          {isDraw
            ? 'DRAW MATCH'
            : mode === 'AI'
            ? isUserWinner
              ? 'VICTORY!'
              : 'DEFEAT!'
            : `${winnerName.toUpperCase()} WINS!`}
        </h2>

        {/* Subtitle / Details */}
        <p className="text-xs sm:text-sm text-slate-400 mb-4">
          {isDraw
            ? 'Neither side surrendered ground. Well played!'
            : mode === 'AI'
            ? isUserWinner
              ? `You outsmarted the ${difficulty} CPU!`
              : `The ${difficulty} AI claimed this round.`
            : `Decisive triumph for ${winnerName}!`}
        </p>

        {/* Streak pill if positive streak */}
        {!isDraw && isUserWinner && currentStreak > 1 && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-semibold mb-5">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{currentStreak} Match Win Streak!</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full space-y-2 mt-2">
          {/* Primary Next Round CTA */}
          <button
            onClick={onNextRound}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-950/60 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>Next Round</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Review Board */}
            <button
              onClick={onReviewBoard}
              className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-medium transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Review Board</span>
            </button>

            {/* Restart Match */}
            <button
              onClick={onRestartSeries}
              className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-medium transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Game</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
