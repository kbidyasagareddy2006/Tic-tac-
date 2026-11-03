/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  BoardState,
  GameMode,
  AIDifficulty,
  PlayerSymbol,
  GameSettings,
  GameStats,
  WinningLine,
  MatchRecord,
} from './types/game';
import { checkWinner, isBoardFull, calculateAIMove } from './utils/gameLogic';
import { soundFx } from './utils/soundEffects';
import { Header } from './components/Header';
import { ScoreBoard } from './components/ScoreBoard';
import { GameBoard } from './components/GameBoard';
import { ResultModal } from './components/ResultModal';
import { SettingsModal } from './components/SettingsModal';
import { StatsModal } from './components/StatsModal';
import { RotateCcw, Swords, Cpu, ChevronRight, Eye } from 'lucide-react';

const DEFAULT_SETTINGS: GameSettings = {
  mode: 'AI',
  difficulty: 'hard',
  userSymbol: 'X',
  startingPlayer: 'user',
  soundEnabled: true,
  player1Name: 'Player 1',
  player2Name: 'Cyber AI',
};

const DEFAULT_STATS: GameStats = {
  totalMatches: 0,
  player1Wins: 0,
  player2Wins: 0,
  draws: 0,
  currentStreak: 0,
  bestStreak: 0,
  history: [],
};

export default function App() {
  // --- Persistent Settings & Lifetime Stats ---
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem('cybertactix_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [stats, setStats] = useState<GameStats>(() => {
    try {
      const saved = localStorage.getItem('cybertactix_stats');
      return saved ? { ...DEFAULT_STATS, ...JSON.parse(saved) } : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  });

  // Current session match counters
  const [sessionScores, setSessionScores] = useState({
    player1Wins: 0,
    player2Wins: 0,
    draws: 0,
  });

  // Board & Round State
  const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState<PlayerSymbol>('X');
  const [winningLine, setWinningLine] = useState<WinningLine | null>(null);
  const [winnerSymbol, setWinnerSymbol] = useState<PlayerSymbol | null>(null);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'draw'>('playing');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);

  // Modals & Overlay state
  const [showResultModal, setShowResultModal] = useState(false);
  const [isBoardReviewed, setIsBoardReviewed] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Ref to track AI timeout to avoid race conditions or orphaned timers
  const aiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync sound settings to soundFx singleton
  useEffect(() => {
    soundFx.setMuted(!settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cybertactix_settings', JSON.stringify(settings));
    } catch {
      // Storage error fallback
    }
  }, [settings]);

  // Save stats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cybertactix_stats', JSON.stringify(stats));
    } catch {
      // Storage error fallback
    }
  }, [stats]);

  // Calculate opponent symbol
  const player1Symbol = settings.userSymbol;
  const player2Symbol = player1Symbol === 'X' ? 'O' : 'X';

  // Determine starting player for a given round
  const getStartingSymbol = useCallback(
    (round: number, currentSettings: GameSettings): PlayerSymbol => {
      const oppSymbol = currentSettings.userSymbol === 'X' ? 'O' : 'X';
      if (currentSettings.startingPlayer === 'user') {
        return currentSettings.userSymbol;
      }
      if (currentSettings.startingPlayer === 'opponent') {
        return oppSymbol;
      }
      // 'alternate'
      return round % 2 === 1 ? currentSettings.userSymbol : oppSymbol;
    },
    []
  );

  // Reset/Start Round
  const startNewRound = useCallback(
    (nextRoundIndex: number, overrideSettings?: GameSettings) => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
        aiTimeoutRef.current = null;
      }

      const activeSettings = overrideSettings || settings;
      const initialTurn = getStartingSymbol(nextRoundIndex, activeSettings);

      setBoard(Array(9).fill(null));
      setWinningLine(null);
      setWinnerSymbol(null);
      setGameStatus('playing');
      setIsAiThinking(false);
      setShowResultModal(false);
      setIsBoardReviewed(false);
      setCurrentTurn(initialTurn);
      setRoundNumber(nextRoundIndex);
    },
    [getStartingSymbol, settings]
  );

  // Full Game Reset (Scores & Board)
  const resetEntireGame = () => {
    soundFx.playRestart();
    setSessionScores({
      player1Wins: 0,
      player2Wins: 0,
      draws: 0,
    });
    startNewRound(1);
  };

  // Launch celebration confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#22d3ee', '#06b6d4', '#c084fc', '#a855f7', '#fbbf24'],
      });
    } catch {
      // Fallback if canvas is unavailable
    }
  };

  // Record completed match in stats
  const recordMatchOutcome = useCallback(
    (outcome: 'player1' | 'player2' | 'draw', winSymbol: PlayerSymbol | null, totalMoves: number) => {
      setStats((prev) => {
        const isP1Win = outcome === 'player1';
        const isP2Win = outcome === 'player2';
        const isDraw = outcome === 'draw';

        const newCurrentStreak = isP1Win ? prev.currentStreak + 1 : 0;
        const newBestStreak = Math.max(prev.bestStreak, newCurrentStreak);

        const newRecord: MatchRecord = {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: Date.now(),
          mode: settings.mode,
          difficulty: settings.mode === 'AI' ? settings.difficulty : undefined,
          winner: outcome,
          winnerName:
            outcome === 'player1'
              ? settings.player1Name
              : outcome === 'player2'
              ? settings.player2Name
              : 'Draw',
          playerSymbol: settings.userSymbol,
          movesCount: totalMoves,
        };

        return {
          totalMatches: prev.totalMatches + 1,
          player1Wins: prev.player1Wins + (isP1Win ? 1 : 0),
          player2Wins: prev.player2Wins + (isP2Win ? 1 : 0),
          draws: prev.draws + (isDraw ? 1 : 0),
          currentStreak: newCurrentStreak,
          bestStreak: newBestStreak,
          history: [newRecord, ...prev.history].slice(0, 50),
        };
      });

      // Update session scores
      setSessionScores((prev) => ({
        player1Wins: prev.player1Wins + (outcome === 'player1' ? 1 : 0),
        player2Wins: prev.player2Wins + (outcome === 'player2' ? 1 : 0),
        draws: prev.draws + (outcome === 'draw' ? 1 : 0),
      }));
    },
    [settings]
  );

  // Handle cell selection
  const handleCellClick = (index: number) => {
    // Prevent move if cell filled, game finished, or AI is thinking
    if (board[index] !== null || gameStatus !== 'playing' || isAiThinking) {
      return;
    }

    // Human move
    const newBoard = [...board];
    newBoard[index] = currentTurn;
    setBoard(newBoard);
    soundFx.playMove(currentTurn);

    // Check if this move wins
    const winResult = checkWinner(newBoard);
    if (winResult) {
      setWinningLine(winResult.line);
      setWinnerSymbol(winResult.winner);
      setGameStatus('won');

      const isP1 = winResult.winner === player1Symbol;
      const outcome = isP1 ? 'player1' : 'player2';
      const movesCount = newBoard.filter(Boolean).length;

      recordMatchOutcome(outcome, winResult.winner, movesCount);

      if (settings.mode === 'AI') {
        if (isP1) {
          soundFx.playWin();
          triggerConfetti();
        } else {
          soundFx.playLoss();
        }
      } else {
        soundFx.playWin();
        triggerConfetti();
      }

      // Show result modal with slight pause so user absorbs the winning strike line
      setTimeout(() => {
        setShowResultModal(true);
      }, 650);
      return;
    }

    // Check for draw
    if (isBoardFull(newBoard)) {
      setGameStatus('draw');
      soundFx.playDraw();
      recordMatchOutcome('draw', null, 9);
      setTimeout(() => {
        setShowResultModal(true);
      }, 650);
      return;
    }

    // Switch turn
    const nextTurn = currentTurn === 'X' ? 'O' : 'X';
    setCurrentTurn(nextTurn);
  };

  // AI Turn Execution
  useEffect(() => {
    if (settings.mode !== 'AI') return;
    if (gameStatus !== 'playing') return;

    const isAITurn = currentTurn === player2Symbol;
    if (!isAITurn) return;

    setIsAiThinking(true);

    // Realistic thinking pause so moves feel deliberate
    const thinkingDelay = settings.difficulty === 'hard' ? 450 : 350;

    aiTimeoutRef.current = setTimeout(() => {
      setBoard((prevBoard) => {
        // Double check game is still playing
        if (gameStatus !== 'playing') return prevBoard;

        const aiMove = calculateAIMove(
          prevBoard,
          settings.difficulty,
          player2Symbol,
          player1Symbol
        );

        if (aiMove === -1 || prevBoard[aiMove] !== null) {
          setIsAiThinking(false);
          return prevBoard;
        }

        const nextBoard = [...prevBoard];
        nextBoard[aiMove] = player2Symbol;
        soundFx.playMove(player2Symbol);

        // Check if AI won
        const win = checkWinner(nextBoard);
        if (win) {
          setWinningLine(win.line);
          setWinnerSymbol(win.winner);
          setGameStatus('won');
          soundFx.playLoss();

          const movesCount = nextBoard.filter(Boolean).length;
          recordMatchOutcome('player2', win.winner, movesCount);

          setTimeout(() => {
            setShowResultModal(true);
          }, 650);
        } else if (isBoardFull(nextBoard)) {
          setGameStatus('draw');
          soundFx.playDraw();
          recordMatchOutcome('draw', null, 9);
          setTimeout(() => {
            setShowResultModal(true);
          }, 650);
        } else {
          setCurrentTurn(player1Symbol);
        }

        setIsAiThinking(false);
        return nextBoard;
      });
    }, thinkingDelay);

    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }
    };
  }, [
    currentTurn,
    gameStatus,
    settings.mode,
    settings.difficulty,
    player1Symbol,
    player2Symbol,
    recordMatchOutcome,
  ]);

  // Apply new settings from modal
  const handleSaveSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    // Restart round cleanly with new rules
    startNewRound(roundNumber, newSettings);
  };

  // Quick mode toggle handler from main screen
  const handleQuickModeToggle = (mode: GameMode) => {
    soundFx.playClick();
    const updated: GameSettings = {
      ...settings,
      mode,
      player2Name: mode === 'AI' ? 'Cyber AI' : 'Player 2',
    };
    setSettings(updated);
    startNewRound(1, updated);
  };

  // Quick difficulty selector
  const handleQuickDifficultyToggle = (diff: AIDifficulty) => {
    soundFx.playClick();
    const updated: GameSettings = {
      ...settings,
      difficulty: diff,
    };
    setSettings(updated);
    startNewRound(roundNumber, updated);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between cyber-grid relative selection:bg-cyan-500/20">
      {/* Ambient background glow accents */}
      <div className="fixed top-12 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-12 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header */}
      <Header
        mode={settings.mode}
        difficulty={settings.difficulty}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => {
          setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
          soundFx.playClick();
        }}
        onOpenStats={() => {
          soundFx.playClick();
          setShowStatsModal(true);
        }}
        onOpenSettings={() => {
          soundFx.playClick();
          setShowSettingsModal(true);
        }}
        onRestartGame={() => {
          soundFx.playRestart();
          startNewRound(roundNumber);
        }}
      />

      {/* Main Game Arena */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 sm:py-6 flex flex-col items-center justify-center gap-4 sm:gap-6">
        {/* Quick Mode & Difficulty Selector Strip */}
        <div className="w-full max-w-xl flex flex-wrap items-center justify-between gap-2 px-1">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
            <button
              onClick={() => handleQuickModeToggle('AI')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                settings.mode === 'AI'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>VS AI</span>
            </button>
            <button
              onClick={() => handleQuickModeToggle('PVP')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                settings.mode === 'PVP'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>2 Players</span>
            </button>
          </div>

          {/* Quick AI Difficulty if in AI mode */}
          {settings.mode === 'AI' && (
            <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
              {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((level) => {
                const active = settings.difficulty === level;
                return (
                  <button
                    key={level}
                    onClick={() => handleQuickDifficultyToggle(level)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                      active
                        ? level === 'hard'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                          : level === 'medium'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {level === 'hard' ? 'Hard' : level}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Live ScoreBoard */}
        <ScoreBoard
          player1Name={settings.player1Name}
          player2Name={settings.player2Name}
          player1Symbol={player1Symbol}
          player2Symbol={player2Symbol}
          player1Score={sessionScores.player1Wins}
          player2Score={sessionScores.player2Wins}
          drawsCount={sessionScores.draws}
          currentTurn={currentTurn}
          isAiThinking={isAiThinking}
          mode={settings.mode}
          difficulty={settings.difficulty}
          isGameOver={gameStatus !== 'playing'}
        />

        {/* Interactive 3x3 Game Board */}
        <div className="relative w-full flex flex-col items-center">
          <GameBoard
            board={board}
            winningLine={winningLine}
            currentTurn={currentTurn}
            isAiThinking={isAiThinking}
            isGameOver={gameStatus !== 'playing'}
            onCellClick={handleCellClick}
          />

          {/* Floating Pill when user is reviewing board after match */}
          {isBoardReviewed && gameStatus !== 'playing' && (
            <div className="mt-4 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setShowResultModal(true);
                  setIsBoardReviewed(false);
                }}
                className="px-4 py-2 rounded-full bg-slate-900 border border-cyan-500/50 text-cyan-300 hover:text-white text-xs font-semibold shadow-lg shadow-cyan-950/60 flex items-center gap-1.5 hover:bg-slate-800 transition-all active:scale-95"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Show Match Results</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playRestart();
                  startNewRound(roundNumber + 1);
                }}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 text-xs font-bold shadow-lg shadow-purple-950/60 flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <span>Next Round</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Quick Action Footer Controls */}
        <div className="w-full max-w-md flex items-center justify-center gap-3 mt-1">
          <button
            onClick={() => {
              soundFx.playRestart();
              startNewRound(roundNumber);
            }}
            className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Restart Round</span>
          </button>

          <button
            onClick={resetEntireGame}
            className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95"
          >
            <span>Reset Scores</span>
          </button>
        </div>
      </main>

      {/* Footer info */}
      <footer className="w-full py-3 px-4 border-t border-slate-900/80 text-center text-[11px] text-slate-500">
        Neon Cyber Tic-Tac-Toe · Real-time Minimax AI · Local 2-Player Match
      </footer>

      {/* Round End Results Modal */}
      <ResultModal
        isOpen={showResultModal}
        status={gameStatus === 'won' ? 'won' : 'draw'}
        winnerSymbol={winnerSymbol}
        winnerName={
          winnerSymbol === player1Symbol ? settings.player1Name : settings.player2Name
        }
        isUserWinner={winnerSymbol === player1Symbol}
        mode={settings.mode}
        difficulty={settings.difficulty}
        currentStreak={stats.currentStreak}
        onNextRound={() => {
          soundFx.playRestart();
          startNewRound(roundNumber + 1);
        }}
        onRestartSeries={() => {
          resetEntireGame();
        }}
        onReviewBoard={() => {
          soundFx.playClick();
          setShowResultModal(false);
          setIsBoardReviewed(true);
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        settings={settings}
        onSave={handleSaveSettings}
        onClose={() => {
          soundFx.playClick();
          setShowSettingsModal(false);
        }}
      />

      {/* Stats Modal */}
      <StatsModal
        isOpen={showStatsModal}
        stats={stats}
        player1Name={settings.player1Name}
        player2Name={settings.player2Name}
        onResetStats={() => {
          setStats({
            totalMatches: 0,
            player1Wins: 0,
            player2Wins: 0,
            draws: 0,
            currentStreak: 0,
            bestStreak: 0,
            history: [],
          });
        }}
        onClose={() => {
          soundFx.playClick();
          setShowStatsModal(false);
        }}
      />
    </div>
  );
}
