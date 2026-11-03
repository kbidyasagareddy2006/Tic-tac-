import React, { useState } from 'react';
import { BoardState, PlayerSymbol, WinningLine } from '../types/game';

interface GameBoardProps {
  board: BoardState;
  winningLine: WinningLine | null;
  currentTurn: PlayerSymbol;
  isAiThinking: boolean;
  isGameOver: boolean;
  onCellClick: (index: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  winningLine,
  currentTurn,
  isAiThinking,
  isGameOver,
  onCellClick,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Line coordinates in percentage for the strike-through
  const getStrikeLineCoords = (type: WinningLine['type']) => {
    switch (type) {
      case 'row-0':
        return { x1: '8%', y1: '16.66%', x2: '92%', y2: '16.66%' };
      case 'row-1':
        return { x1: '8%', y1: '50%', x2: '92%', y2: '50%' };
      case 'row-2':
        return { x1: '8%', y1: '83.33%', x2: '92%', y2: '83.33%' };
      case 'col-0':
        return { x1: '16.66%', y1: '8%', x2: '16.66%', y2: '92%' };
      case 'col-1':
        return { x1: '50%', y1: '8%', x2: '50%', y2: '92%' };
      case 'col-2':
        return { x1: '83.33%', y1: '8%', x2: '83.33%', y2: '92%' };
      case 'diag-main':
        return { x1: '12%', y1: '12%', x2: '88%', y2: '88%' };
      case 'diag-anti':
        return { x1: '88%', y1: '12%', x2: '12%', y2: '88%' };
      default:
        return null;
    }
  };

  const strikeCoords = winningLine ? getStrikeLineCoords(winningLine.type) : null;

  return (
    <div className="relative w-full max-w-[340px] sm:max-w-[400px] aspect-square mx-auto p-3 sm:p-4 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-2xl backdrop-blur-md">
      {/* 3x3 Grid */}
      <div className="grid grid-cols-3 grid-rows-3 gap-2.5 sm:gap-3.5 w-full h-full">
        {board.map((cellValue, index) => {
          const isWinningCell = winningLine?.indices.includes(index);
          const isDisabled = cellValue !== null || isGameOver || isAiThinking;
          const showHoverPreview = !isDisabled && hoveredIndex === index;

          return (
            <button
              key={index}
              onClick={() => onCellClick(index)}
              onMouseEnter={() => !isDisabled && setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              disabled={isDisabled}
              aria-label={`Board cell ${index + 1}, ${cellValue || 'empty'}`}
              className={`relative rounded-2xl flex items-center justify-center transition-all duration-200 select-none cursor-pointer disabled:cursor-default overflow-hidden ${
                isWinningCell
                  ? 'bg-gradient-to-br from-cyan-950/80 to-purple-950/80 border-2 border-cyan-400 box-glow-win scale-[1.03] z-10'
                  : cellValue
                  ? 'bg-slate-950/70 border border-slate-800/90 shadow-inner'
                  : 'bg-slate-950/40 border border-slate-800/60 hover:border-slate-700/80 hover:bg-slate-900/50 active:scale-95'
              }`}
            >
              {/* Inner ambient glow on cell */}
              <div className="absolute inset-0 bg-radial from-transparent to-black/20 pointer-events-none" />

              {/* Render X */}
              {cellValue === 'X' && (
                <svg
                  className="w-12 h-12 sm:w-16 sm:h-16 text-cyan-400 glow-cyan transition-transform duration-300 transform scale-100 animate-in zoom-in-75"
                  viewBox="0 0 64 64"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                >
                  <line x1="16" y1="16" x2="48" y2="48" />
                  <line x1="48" y1="16" x2="16" y2="48" />
                </svg>
              )}

              {/* Render O */}
              {cellValue === 'O' && (
                <svg
                  className="w-12 h-12 sm:w-16 sm:h-16 text-purple-400 glow-purple transition-transform duration-300 transform scale-100 animate-in zoom-in-75"
                  viewBox="0 0 64 64"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="7"
                  strokeLinecap="round"
                >
                  <circle cx="32" cy="32" r="18" />
                </svg>
              )}

              {/* Ghost Hover Preview */}
              {showHoverPreview && (
                <div className="opacity-25 transition-opacity">
                  {currentTurn === 'X' ? (
                    <svg
                      className="w-10 h-10 sm:w-14 sm:h-14 text-cyan-400"
                      viewBox="0 0 64 64"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      strokeLinecap="round"
                    >
                      <line x1="16" y1="16" x2="48" y2="48" />
                      <line x1="48" y1="16" x2="16" y2="48" />
                    </svg>
                  ) : (
                    <svg
                      className="w-10 h-10 sm:w-14 sm:h-14 text-purple-400"
                      viewBox="0 0 64 64"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                    >
                      <circle cx="32" cy="32" r="18" />
                    </svg>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* SVG Strike-through Line for Winning Combination */}
      {strikeCoords && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="strike-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#e879f9" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <filter id="laser-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer glow stroke */}
          <line
            x1={strikeCoords.x1}
            y1={strikeCoords.y1}
            x2={strikeCoords.x2}
            y2={strikeCoords.y2}
            stroke="url(#strike-gradient)"
            strokeWidth="10"
            strokeLinecap="round"
            filter="url(#laser-glow)"
            className="opacity-90"
          />

          {/* Core bright laser stroke */}
          <line
            x1={strikeCoords.x1}
            y1={strikeCoords.y1}
            x2={strikeCoords.x2}
            y2={strikeCoords.y2}
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
};
