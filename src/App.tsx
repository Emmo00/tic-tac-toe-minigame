import { sdk } from "@farcaster/frame-sdk";
import { useEffect } from "react";


function App() {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <>
      <div className="board" id="board">
        <div className="cell" data-cell></div>
        <div className="cell" data-cell></div>
        <div className="cell" data-cell></div>
        <div className="cell" data-cell></div>
        <div className="cell" data-cell></div>
        <div className="cell" data-cell></div>
        <div className="cell" data-cell></div>
        <div className="cell" data-cell></div>
        <div className="cell" data-cell></div>
      </div>
      <br />
      <div className="stats">
        <table>
          <tr>
            <th>X(you)</th>
            <th>Draw</th>
            <th>O(computer)</th>
          </tr>
          <tr>
            <td id="x-score">0</td>
            <td id="draw-score">0</td>
            <td id="o-score">0</td>
          </tr>
        </table>
        <button className="clear-button" id="clear-button">
          Clear Data
        </button>
      </div>
      <div className="winning-message" id="winning-message">
        <div data-winning-message-text>X wins!</div>
        <button id="restart-button">Restart</button>
      </div>
      <footer>
        AI by {" \t"}
        <a
        style={{
          marginLeft: "3px"
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
