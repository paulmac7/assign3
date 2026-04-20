import * as React from 'react'
import * as ReactBootstrap from 'react-bootstrap'
import { useState } from 'react';

const { Badge, Button, Card } = ReactBootstrap

function Square({ value, onSquareClick, bg }) {
  return (
    <button 
      className="square"
      onClick={onSquareClick}
      style={{ backgroundColor: bg }}
    >
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, move }) {
  // determine winner + display text
  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  // determine count of each
  const xCount = Math.ceil(move / 2);
  const oCount = Math.floor(move / 2);
  const [selectedGrain, setSelectedGrain] = useState(-1);  
  
  function handleClick(i) {
    const nextSquares = squares.slice(); // copies squares array

    if ((xIsNext && xCount < 3) || (!xIsNext && oCount < 3)) {
      if (squares[i] || calculateWinner(squares)) {
        return; // dont do anything if square is already filled
      }
      // flip to determine which player's turn it is
      if (xIsNext) {
        nextSquares[i] = "X";
      } else {
        nextSquares[i] = "O";
      }
    } else {
      if (calculateWinner(squares)) {
        return; // dont do anything if the game is won
      } else if (selectedGrain === -1) {
        let player = xIsNext ? "X" : "O";
        if (squares[i] === player) {
          setSelectedGrain(i);
        }
        return; // do NOT call onPlay
      } else {
        if (squares[i] === null) {
          nextSquares[i] = nextSquares[selectedGrain];
          nextSquares[selectedGrain] = null;
          setSelectedGrain(-1);
        }
      }
    }

    onPlay(nextSquares);
  }

  function getBG(i) {
    // returns gray if selected, white if not
    if (selectedGrain === i) {
      return "lightgray";
    } else {
      return "white";
    }
  }
  
  // arrow function: concisely defines function
  return (
    <>
      <div className="status">{status}</div>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} bg={getBG(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} bg={getBG(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} bg={getBG(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} bg={getBG(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} bg={getBG(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} bg={getBG(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} bg={getBG(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} bg={getBG(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} bg={getBG(8)} />
      </div>
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]); 
  const [currentMove, setCurrentMove] = useState(0);  
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    // ... copies all of history's previous states and appends nextSquares to it
    // this adds nextSquares after the relevant portion of the history only,
    // not adding it to the very end; the "alternate timeline" is overwritten
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory); 
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  // map function transforms an array into another one by
  // processing the array's contents with the given => func
  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = "Go to move #" + move;
    } else {
      description = "Go to game start";
    }

    // transforms the history array into buttons
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    )
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} move={currentMove} />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}