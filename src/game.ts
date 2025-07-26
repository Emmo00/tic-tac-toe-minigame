// Copied from public/game.js for module import
interface Board extends Array<Array<"x" | "o" | null>> {}

interface Action {
  player: "x" | "o";
  position: [number, number];
}

class Game {
  xFirst = true;
  board: Board;

  constructor(board: Board | null = null) {
    if (!board) this.board = this.createBoard();
    else this.board = board;
  }

  createBoard(): Board {
    return [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ];
  }

  player(state: Board): "x" | "o" {
    const plays: Array<"x" | "o" | null> = [...state[0], ...state[1], ...state[2]];
    const nbX: number = plays.reduce((prev: number, curr: "x" | "o" | null) => {
      if (curr === "x") prev++;
      return prev;
    }, 0);
    const nbO: number = plays.reduce((prev: number, curr: "x" | "o" | null) => {
      if (curr === "o") prev++;
      return prev;
    }, 0);
    let order: ["x", "o"] | ["o", "x"] = ["x", "o"];
    if (this.xFirst) order = ["o", "x"];
    return order[Number(nbX === nbO)];
  }

  actions(state: Board): Action[] {
    const acts: Action[] = [];
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

  result(state: Board, action: Action | null): Board {
    if (!action) return state;
    const { player, position } = action;
    let c_state: Board = [[...state[0]], [...state[1]], [...state[2]]];
    c_state[position[1]][position[0]] = player;
    return c_state;
  }

  terminal(state: Board): boolean {
    return (
      this.playerWon(state, "x") ||
      this.playerWon(state, "o") ||
      this.tieCheck(state)
    );
  }

  utility(state: Board): number {
    return this.playerWon(state, "x") ? 1 : this.playerWon(state, "o") ? -1 : 0;
  }

  playerWon(state: Board, player: "x" | "o"): boolean {
    return (
      this.verticalWinCheck(state, player) ||
      this.horizontalWinCheck(state, player) ||
      this.diagonalWinCheck(state, player)
    );
  }

  verticalWinCheck(state: Board, player: "x" | "o"): boolean {
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

  horizontalWinCheck(state: Board, player: "x" | "o"): boolean {
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

  diagonalWinCheck(state: Board, player: "x" | "o"): boolean {
    let dia1Count = 0;
    let dia2Count = 0;
    for (let i = 0; i < 3; i++) {
      if (state[i][i] === player) dia1Count++;
      if (state[i][2 - i] === player) dia2Count++;
    }
    if ([dia1Count, dia2Count].includes(3)) return true;
    return false;
  }

  tieCheck(state: Board): boolean {
    return (
      (function () {
        return ![...state[0], ...state[1], ...state[2]].includes(null);
      })() && !(this.playerWon(state, "x") || this.playerWon(state, "o"))
    );
  }

  nextRound(): this {
    this.xFirst = !this.xFirst;
    return this;
  }

  makeMove(action: Action): void {
    this.board = this.result(this.board, action);
  }
}

class AI {
  play(game: Game): any {
    if (game.player(game.board) === "x") return this.max(game);
    return this.mini(game);
  }

  max(game: Game, action: Action | null = null): any {
    if (!action || !game.terminal(game.result(game.board, action))) {
      const board: Board = action ? game.result(game.board, action) : game.board;
      let v = -44444444444;
      let choice: any = {};
      for (let action of this.shuffle(game.actions(board))) {
        const miniChoice = this.mini(new Game(board).nextRound(), action);
        const { utility } = miniChoice;
        if (utility > v) {
          v = utility;
          choice = { ...action, utility };
        }
      }
      return choice;
    }
    return {
      ...action,
      utility: game.utility(game.result(game.board, action)),
    };
  }

  mini(game: Game, action: Action | null = null): any {
    if (!action || !game.terminal(game.result(game.board, action))) {
      const board: Board = action ? game.result(game.board, action) : game.board;
      let v = 44444444444;
      let choice: any = {};
      for (let action of this.shuffle(game.actions(board))) {
        const maxChoice = this.max(new Game(board), action);
        const { utility } = maxChoice;
        if (utility < v) {
          v = utility;
          choice = { ...action, utility };
        }
      }
      return choice;
    }
    return {
      ...action,
      utility: game.utility(game.result(game.board, action)),
    };
  }

  shuffle<T>(array: T[]): T[] {
    let c_array: T[] = JSON.parse(JSON.stringify(array));
    let arrLen: number = c_array.length;

    while (arrLen != 0) {
      let randIndex: number = Math.floor(Math.random() * arrLen);
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
