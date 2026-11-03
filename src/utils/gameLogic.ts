import { BoardState, PlayerSymbol, WinningLine, AIDifficulty } from '../types/game';

export const WINNING_COMBINATIONS: { indices: [number, number, number]; type: WinningLine['type'] }[] = [
  // Rows
  { indices: [0, 1, 2], type: 'row-0' },
  { indices: [3, 4, 5], type: 'row-1' },
  { indices: [6, 7, 8], type: 'row-2' },
  // Columns
  { indices: [0, 3, 6], type: 'col-0' },
  { indices: [1, 4, 7], type: 'col-1' },
  { indices: [2, 5, 8], type: 'col-2' },
  // Diagonals
  { indices: [0, 4, 8], type: 'diag-main' },
  { indices: [2, 4, 6], type: 'diag-anti' },
];

export function checkWinner(board: BoardState): { winner: PlayerSymbol; line: WinningLine } | null {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo.indices;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        winner: board[a] as PlayerSymbol,
        line: { indices: combo.indices, type: combo.type },
      };
    }
  }
  return null;
}

export function isBoardFull(board: BoardState): boolean {
  return board.every((cell) => cell !== null);
}

export function getEmptyIndices(board: BoardState): number[] {
  const indices: number[] = [];
  board.forEach((val, idx) => {
    if (val === null) indices.push(idx);
  });
  return indices;
}

// Check if a move would result in a win for the given symbol
function findWinningMove(board: BoardState, symbol: PlayerSymbol): number | null {
  const empty = getEmptyIndices(board);
  for (const idx of empty) {
    const testBoard = [...board];
    testBoard[idx] = symbol;
    if (checkWinner(testBoard)) {
      return idx;
    }
  }
  return null;
}

// Minimax algorithm for unbeatable Hard AI
function minimax(
  currentBoard: BoardState,
  depth: number,
  isMaximizing: boolean,
  aiSymbol: PlayerSymbol,
  humanSymbol: PlayerSymbol
): { score: number; index: number } {
  const winResult = checkWinner(currentBoard);
  if (winResult) {
    if (winResult.winner === aiSymbol) {
      return { score: 10 - depth, index: -1 };
    }
    return { score: depth - 10, index: -1 };
  }

  const emptySpots = getEmptyIndices(currentBoard);
  if (emptySpots.length === 0) {
    return { score: 0, index: -1 };
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    let bestMove = emptySpots[0];

    for (const spot of emptySpots) {
      currentBoard[spot] = aiSymbol;
      const result = minimax(currentBoard, depth + 1, false, aiSymbol, humanSymbol);
      currentBoard[spot] = null;

      if (result.score > bestScore) {
        bestScore = result.score;
        bestMove = spot;
      }
    }
    return { score: bestScore, index: bestMove };
  } else {
    let bestScore = Infinity;
    let bestMove = emptySpots[0];

    for (const spot of emptySpots) {
      currentBoard[spot] = humanSymbol;
      const result = minimax(currentBoard, depth + 1, true, aiSymbol, humanSymbol);
      currentBoard[spot] = null;

      if (result.score < bestScore) {
        bestScore = result.score;
        bestMove = spot;
      }
    }
    return { score: bestScore, index: bestMove };
  }
}

// Calculate AI Move according to selected difficulty
export function calculateAIMove(
  board: BoardState,
  difficulty: AIDifficulty,
  aiSymbol: PlayerSymbol,
  humanSymbol: PlayerSymbol
): number {
  const emptyIndices = getEmptyIndices(board);
  if (emptyIndices.length === 0) return -1;

  // Easy mode: random move
  if (difficulty === 'easy') {
    const randomIndex = Math.floor(Math.random() * emptyIndices.length);
    return emptyIndices[randomIndex];
  }

  // Medium mode: strategic, winning and blocking with high probability
  if (difficulty === 'medium') {
    // 1. Can AI win immediately?
    const winMove = findWinningMove(board, aiSymbol);
    if (winMove !== null) return winMove;

    // 2. Can Human win immediately? Block them!
    const blockMove = findWinningMove(board, humanSymbol);
    if (blockMove !== null) return blockMove;

    // 3. Take center if open (75% preference)
    if (board[4] === null && Math.random() < 0.75) {
      return 4;
    }

    // 4. Take corners if available
    const corners = [0, 2, 6, 8].filter((idx) => board[idx] === null);
    if (corners.length > 0 && Math.random() < 0.6) {
      return corners[Math.floor(Math.random() * corners.length)];
    }

    // Fallback: pick any random open cell
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  // Hard mode: Unbeatable Minimax
  // Optimization: If board is completely empty, pick center or corner instantly to reduce recursion
  if (emptyIndices.length === 9) {
    const openingMoves = [4, 0, 2, 6, 8];
    return openingMoves[Math.floor(Math.random() * openingMoves.length)];
  }

  // If 8 empty cells and center is free, take center or corner
  if (emptyIndices.length === 8) {
    if (board[4] === null) return 4;
    const corners = [0, 2, 6, 8];
    return corners[Math.floor(Math.random() * corners.length)];
  }

  const result = minimax([...board], 0, true, aiSymbol, humanSymbol);
  return result.index !== -1 ? result.index : emptyIndices[0];
}
