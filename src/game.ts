// Copied from public/game.js for module import
class Game {
  xFirst = true;
  board: ("x" | "o" | null)[][];

  constructor(board: ("x" | "o" | null)[][] | null = null) {
    if (!board) this.board = this.createBoard();
    else this.board = board;
  }

  createBoard() {
    return [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ];
  }

  player(state: ("x" | "o" | null)[][]) {
    const plays = [...state[0], ...state[1], ...state[2]];
    const nbX = plays.reduce((prev, curr) => {
      if (curr === "x") prev++;
      return prev;
    }, 0);
    const nbO = plays.reduce((prev, curr) => {
      if (curr === "o") prev++;
      return prev;
    }, 0);
    // If X and O have equal moves, it's X's turn (X goes first)
    // If X has one more move than O, it's O's turn
    return nbX === nbO ? "x" : "o";
  }

  actions(state: ("x" | "o" | null)[][]) {
    const acts = [];
    const player = this.player(state);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (!state[i][j]) {
          acts.push({ player, position: [j, i] });
        }
      }
    }
    return acts;
  }

  result(
    state: ("x" | "o" | null)[][],
    action: { player: "x" | "o"; position: [number, number] }
  ) {
    if (!action) return state;
    const { player, position } = action;
    let c_state = [[...state[0]], [...state[1]], [...state[2]]];
    c_state[position[1]][position[0]] = player;
    return c_state;
  }

  terminal(state: ("x" | "o" | null)[][]) {
    return (
      this.playerWon(state, "x") ||
      this.playerWon(state, "o") ||
      this.tieCheck(state)
    );
  }

  utility(state: ("x" | "o" | null)[][]) {
    return this.playerWon(state, "x") ? 1 : this.playerWon(state, "o") ? -1 : 0;
  }

  playerWon(state: ("x" | "o" | null)[][], player: "x" | "o") {
    return (
      this.verticalWinCheck(state, player) ||
      this.horizontalWinCheck(state, player) ||
      this.diagonalWinCheck(state, player)
    );
  }

  verticalWinCheck(state: ("x" | "o" | null)[][], player: "x" | "o") {
    for (let i = 0; i < 3; i++) {
      let rowCount = 0;
      for (let j = 0; j < 3; j++) {
        if (state[j][i] == player) {
          rowCount++;
        }
      }
      if (rowCount === 3) return true;
      rowCount = 0;
    }
    return false;
  }

  horizontalWinCheck(state: ("x" | "o" | null)[][], player: "x" | "o") {
    for (let i = 0; i < 3; i++) {
      let rowCount = 0;
      for (let j = 0; j < 3; j++) {
        if (state[i][j] == player) {
          rowCount++;
        }
      }
      if (rowCount === 3) return true;
      rowCount = 0;
    }
    return false;
  }

  diagonalWinCheck(state: ("x" | "o" | null)[][], player: "x" | "o") {
    let dia1Count = 0;
    let dia2Count = 0;
    for (let i = 0; i < 3; i++) {
      if (state[i][i] === player) dia1Count++;
      if (state[i][2 - i] === player) dia2Count++;
    }
    if ([dia1Count, dia2Count].includes(3)) return true;
    return false;
  }

  tieCheck(state: ("x" | "o" | null)[][]) {
    return (
      (function () {
        return ![...state[0], ...state[1], ...state[2]].includes(null);
      })() && !(this.playerWon(state, "x") || this.playerWon(state, "o"))
    );
  }

  nextRound() {
    this.xFirst = !this.xFirst;
    return this;
  }

  makeMove(action: { player: "x" | "o"; position: [number, number] }) {
    this.board = this.result(this.board, action);
  }
}

class AI {
  constructor() {
    // AI can be configured to play with different difficulty levels
    this.setDifficulty("easy");
  }

  // difficulty level to their depth
  // "easy" - random moves, "medium" - minimax with depth 2, "hard" - minimax with depth (unlimited)
  difficulty: "easy" | "medium" | "hard" = "easy";
  MEDIUM_DEPTH = 2;

  setDifficulty(difficulty: "easy" | "medium" | "hard" = "hard") {
    this.difficulty = difficulty;
  }

  play(game: Game) {
    if (game.player(game.board) === "x") return this.max(game);
    return this.mini(game);
  }

  max(
    game: Game,
    action: { player: "x" | "o"; position: [number, number] } | null = null,
    depth: number = 0
  ): { player: "x" | "o"; position: [number, number]; utility: number } {
    if (!action || !game.terminal(game.result(game.board, action))) {
      // if easy difficulty, return a random action
      if (this.difficulty === "easy") {
        action = this.shuffle(game.actions(game.board))[0];
      }

      const board = action ? game.result(game.board, action) : game.board;
      let v = -44444444444;
      let choice: {
        player: "x" | "o";
        position: [number, number];
        utility: number;
      } | null = null;
      for (let action of this.shuffle(game.actions(board))) {
        // if medium difficulty, limit depth
        if (this.difficulty === "medium" && depth >= this.MEDIUM_DEPTH) {
          return action;
        }

        const miniChoice = this.mini(
          new Game(board).nextRound(),
          action,
          depth + 1
        );
        const { utility } = miniChoice;
        if (utility > v) {
          v = utility;
          choice = { ...action, utility };
        }
      }
      if (choice) return choice;
      // Fallback: return a dummy action (should not happen in normal gameplay)
      return {
        player: "x",
        position: [0, 0],
        utility: v,
      };
    }
    return {
      ...action,
      utility: game.utility(game.result(game.board, action)),
    };
  }

  mini(
    game: Game,
    action: { player: "x" | "o"; position: [number, number] } | null = null,
    depth: number = 0
  ): { player: "x" | "o"; position: [number, number]; utility: number } {
    if (!action || !game.terminal(game.result(game.board, action))) {
      // if easy difficulty, return a random action
      if (this.difficulty === "easy") {
        action = this.shuffle(game.actions(game.board))[0];
      }

      const board = action ? game.result(game.board, action) : game.board;
      let v = 44444444444;
      let choice: {
        player: "x" | "o";
        position: [number, number];
        utility: number;
      } | null = null;
      for (let action of this.shuffle(game.actions(board))) {
        // if medium difficulty, limit depth
        if (this.difficulty === "medium" && depth >= this.MEDIUM_DEPTH) {
          return action;
        }

        const maxChoice = this.max(new Game(board), action, depth + 1);
        const { utility } = maxChoice;
        if (utility < v) {
          v = utility;
          choice = { ...action, utility };
        }
      }
      if (choice) return choice;
      // Fallback: return a dummy action (should not happen in normal gameplay)
      return {
        player: "o",
        position: [0, 0],
        utility: v,
      };
    }
    return {
      ...action,
      utility: game.utility(game.result(game.board, action)),
    };
  }

  shuffle(array: any[]) {
    let c_array = JSON.parse(JSON.stringify(array));
    let arrLen = c_array.length;

    while (arrLen != 0) {
      let randIndex = Math.floor(Math.random() * arrLen);
      arrLen--;
      [c_array[arrLen], c_array[randIndex]] = [
        c_array[randIndex],
        c_array[arrLen],
      ];
    }
    return c_array;
  }
}

export { Game, AI };
