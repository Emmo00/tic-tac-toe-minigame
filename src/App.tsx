import { sdk } from "@farcaster/frame-sdk";
import { useEffect, useState } from "react";
import { Game, AI } from "./game.ts";

function App() {
  useEffect(() => {
    sdk.actions.ready();
  }, []);
  
  const getInitialBoard = (): ("x" | "o" | null)[][] => [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];

  // Board state: 3x3 array
  const [board, setBoard] = useState<("x" | "o" | null)[][]>(getInitialBoard());
  // Whose turn: true for X, false for O
  const [xTurn, setXTurn] = useState(true);
  // Who goes first in next round
  const [xFirst, setXFirst] = useState(true);
  // Scores
  const [scores, setScores] = useState({ x: 0, o: 0, draw: 0 });
  // Winning message
  const [winningMessage, setWinningMessage] = useState("");
  // Show winning message
  const [showWinning, setShowWinning] = useState(false);

  // Game and AI instances
  const [game, setGame] = useState(() => new Game(getInitialBoard()));
  const [ai] = useState(() => new AI());

  // Sync game.xFirst with xFirst
  useEffect(() => {
    game.xFirst = xFirst;
  }, [xFirst, game]);

  // Start new game
  const startGame = () => {
    setBoard(getInitialBoard());
    setGame(new Game(getInitialBoard()));
    setShowWinning(false);
    setWinningMessage("");
    setXTurn(xFirst);
  };

  // Clear scores
  const clearScores = () => {
    setScores({ x: 0, o: 0, draw: 0 });
    localStorage.setItem("xScore", "0");
    localStorage.setItem("oScore", "0");
    localStorage.setItem("drawScore", "0");
  };

  // Load scores from localStorage
  useEffect(() => {
    setScores({
      x: Number(localStorage.getItem("xScore")) || 0,
      o: Number(localStorage.getItem("oScore")) || 0,
      draw: Number(localStorage.getItem("drawScore")) || 0,
    });
  }, []);

  // Save scores to localStorage
  useEffect(() => {
    localStorage.setItem("xScore", String(scores.x));
    localStorage.setItem("oScore", String(scores.o));
    localStorage.setItem("drawScore", String(scores.draw));
  }, [scores]);

  // Check win/draw after every move
  useEffect(() => {
    if (game.playerWon(board, "x")) {
      setWinningMessage("X wins!");
      setShowWinning(true);
      setScores((s) => ({ ...s, x: s.x + 1 }));
    } else if (game.playerWon(board, "o")) {
      setWinningMessage("O wins!");
      setShowWinning(true);
      setScores((s) => ({ ...s, o: s.o + 1 }));
    } else if (game.tieCheck(board)) {
      setWinningMessage("Draw!");
      setShowWinning(true);
      setScores((s) => ({ ...s, draw: s.draw + 1 }));
    }
  }, [board, game]);

  // AI move if it's O's turn and game not over
  useEffect(() => {
    if (!xTurn && !game.terminal(board)) {
      setTimeout(() => {
        const action = ai.play(game);
        game.makeMove(action);
        setBoard(
          game.board.map((row: (string | null)[]) =>
            row.map(
              (cell) =>
                (cell === "x" || cell === "o" ? cell : null) as "x" | "o" | null
            )
          )
        );
        setXTurn(true);
        game.nextRound();
      }, 400);
    }
    // eslint-disable-next-line
  }, [xTurn, game, board]);

  // Handle cell click
  interface Action {
    player: "x" | "o";
    position: [number, number];
  }

  const handleCellClick = (rowIdx: number, colIdx: number): void => {
    if (board[rowIdx][colIdx] || game.terminal(board) || !xTurn) return;
    const action: Action = { player: "x", position: [colIdx, rowIdx] };
    game.makeMove(action);
    setBoard(
      game.board.map((row: (string | null)[]) =>
        row.map(
          (cell) =>
            (cell === "x" || cell === "o" ? cell : null) as "x" | "o" | null
        )
      )
    );
    setXTurn(false);
    game.nextRound();
  };

  return (
    <>
      <div className="board" id="board">
        {board.map((row, rowIdx) =>
          row.map((cell, colIdx) => (
            <div
              key={rowIdx * 3 + colIdx}
              className={`cell${cell === "x" ? " x" : cell === "o" ? " o" : ""}`}
              data-cell
              onClick={() => handleCellClick(rowIdx, colIdx)}
              style={{
                cursor:
                  board[rowIdx][colIdx] || game.terminal(board) || !xTurn
                    ? "not-allowed"
                    : "pointer",
              }}
            ></div>
          ))
        )}
      </div>
      <br />
      <div className="stats">
        <table>
          <thead>
            <tr>
              <th>X(you)</th>
              <th>Draw</th>
              <th>O(computer)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td id="x-score">{scores.x}</td>
              <td id="draw-score">{scores.draw}</td>
              <td id="o-score">{scores.o}</td>
            </tr>
          </tbody>
        </table>
        <button
          className="clear-button"
          id="clear-button"
          onClick={clearScores}
        >
          Clear Data
        </button>
      </div>
      <div
        className="winning-message"
        id="winning-message"
        style={{ display: showWinning ? "block" : "none" }}
      >
        <div data-winning-message-text>{winningMessage}</div>
        <button
          id="restart-button"
          onClick={() => {
            setXFirst(!xFirst);
            startGame();
          }}
        >
          Restart
        </button>
      </div>
      <footer>
        AI by {" \t"}
        <a
          style={{
            marginLeft: "3px",
          }}
          href="http://farcaster.xyz/emmo00"
          target="_blank"
          rel="noopener noreferrer"
        >
          Emmanuel
        </a>
      </footer>
    </>
  );
}

export default App;
