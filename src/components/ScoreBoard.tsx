import React from 'react';
import { PlayerSymbol, GameMode, AIDifficulty } from '../types/game';
import { Bot, User, Users } from 'lucide-react';

interface ScoreBoardProps {
  player1Name: string;
  player2Name: string;
  player1Symbol: PlayerSymbol;
  player2Symbol: PlayerSymbol;
  player1Score: number;
  player2Score: number;
  drawsCount: number;
  currentTurn: PlayerSymbol;
  isAiThinking: boolean;
  mode: GameMode;
  difficulty: AIDifficulty;
  isGameOver: boolean;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  player1Name,
  player2Name,
  player1Symbol,
  player2Symbol,
  player1Score,
  player2Score,
  drawsCount,
  currentTurn,
  isAiThinking,
  mode,
  difficulty,
  isGameOver,
}) => {
  const isP1Turn = !isGameOver && currentTurn === player1Symbol;
  const isP2Turn = !isGameOver && currentTurn === player2Symbol;

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <div className="grid grid-cols-3 gap-2 sm:gap-4 items-stretch">
        {/* Player 1 Card */}
        <div
          className={`relative rounded-2xl p-3 sm:p-4 border transition-all duration-300 flex flex-col justify-between ${
            isP1Turn
              ? 'bg-cyan-950/30 border-cyan-500/50 box-glow-cyan shadow-lg shadow-cyan-950/50'
              : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
          }`}
        >
          {isP1Turn && (
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-cyan-500 text-slate-950 text-[10px] font-bold tracking-wider rounded-full uppercase shadow-md shadow-cyan-500/40 animate-pulse">
              Turn
            </div>
          )}

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-xs sm:text-sm font-semibold truncate text-slate-200">
                {player1Name}
              </span>
            </div>
            <span
              className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                player1Symbol === 'X'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 glow-cyan'
                  : 'bg-purple-500/20 text-purple-400 border border-purple-500/40 glow-purple'
              }`}
            >
              {player1Symbol}
            </span>
          </div>

          <div className="mt-1">
            <div className="text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight text-white font-mono">
              {player1Score}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
              Wins
            </div>
          </div>
        </div>

        {/* Center Ties Card */}
        <div className="rounded-2xl p-3 sm:p-4 bg-slate-900/40 border border-slate-800/60 flex flex-col items-center justify-between text-center">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Draws
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight text-slate-300 font-mono my-0.5">
            {drawsCount}
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
            {mode === 'AI' ? (
              <span className="capitalize">{difficulty}</span>
            ) : (
              <span>Local 1v1</span>
            )}
          </div>
        </div>

        {/* Player 2 / AI Card */}
        <div
          className={`relative rounded-2xl p-3 sm:p-4 border transition-all duration-300 flex flex-col justify-between ${
            isP2Turn
              ? 'bg-purple-950/30 border-purple-500/50 box-glow-purple shadow-lg shadow-purple-950/50'
              : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
          }`}
        >
          {isP2Turn && (
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-purple-500 text-white text-[10px] font-bold tracking-wider rounded-full uppercase shadow-md shadow-purple-500/40">
              {isAiThinking ? (
                <span className="flex items-center gap-1 animate-pulse">Thinking...</span>
              ) : (
                'Turn'
              )}
            </div>
          )}

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 overflow-hidden">
              {mode === 'AI' ? (
                <Bot className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              ) : (
                <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              )}
              <span className="text-xs sm:text-sm font-semibold truncate text-slate-200">
                {player2Name}
              </span>
            </div>
            <span
              className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                player2Symbol === 'X'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 glow-cyan'
                  : 'bg-purple-500/20 text-purple-400 border border-purple-500/40 glow-purple'
              }`}
            >
              {player2Symbol}
            </span>
          </div>

          <div className="mt-1">
            <div className="text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight text-white font-mono">
              {player2Score}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
              Wins
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
