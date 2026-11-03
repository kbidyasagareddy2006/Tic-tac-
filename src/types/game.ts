export type PlayerSymbol = 'X' | 'O';
export type CellValue = PlayerSymbol | null;
export type BoardState = CellValue[];

export type GameMode = 'AI' | 'PVP';
export type AIDifficulty = 'easy' | 'medium' | 'hard';
export type StartingPlayer = 'user' | 'opponent' | 'alternate';

export interface WinningLine {
  indices: [number, number, number];
  type: 'row-0' | 'row-1' | 'row-2' | 'col-0' | 'col-1' | 'col-2' | 'diag-main' | 'diag-anti';
}

export type GameStatus = 'playing' | 'won' | 'draw';

export interface GameSettings {
  mode: GameMode;
  difficulty: AIDifficulty;
  userSymbol: PlayerSymbol;
  startingPlayer: StartingPlayer;
  soundEnabled: boolean;
  player1Name: string;
  player2Name: string;
}

export interface MatchRecord {
  id: string;
  timestamp: number;
  mode: GameMode;
  difficulty?: AIDifficulty;
  winner: 'player1' | 'player2' | 'draw';
  winnerName: string;
  playerSymbol: PlayerSymbol;
  movesCount: number;
}

export interface GameStats {
  totalMatches: number;
  player1Wins: number;
  player2Wins: number;
  draws: number;
  currentStreak: number;
  bestStreak: number;
  history: MatchRecord[];
}
