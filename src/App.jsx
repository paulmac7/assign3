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

function Board({ xIsNext, squares, onPlay, move, grain, onGrain }) {
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
      } else if (grain === -1) {
        let player = xIsNext ? "X" : "O";
        if (squares[i] === player) {
          onGrain(i);
        }
        return; // do NOT call onPlay
      } else {
        if (i === grain || !isAdjacent(grain, i)) {
          // allow deselection
          onGrain(-1);
          return;
        }
        if (squares[i] === null && isAdjacent(grain, i)) {
          nextSquares[i] = nextSquares[grain];
          nextSquares[grain] = null;
          onGrain(-1);
        } else {
          return;
        }
      }
    }

    onPlay(nextSquares);
  }

  function getBG(i) {
    // returns gray if selected, white if not
    if (grain === i) {
      return "lightgray";
    } else if (isAdjacent(grain, i)) {
      return "lightgreen";
    } else {
      return "white";
    }
  }

  function isAdjacent(source, target) {
    // if source is invalid, return false immediately
    if (source < 0 || source > 8) return false;

    // check if the player has the center square but does NOT
    // have the center selected
    let mustVacate = source !== 4 && (squares[source] === squares[4]);

    const row = Math.floor(source / 3);
    const col = source % 3;

    const up = 3 * (row - 1) + col;
    const down = 3 * (row + 1) + col;
    const left = 3 * row + (col - 1);
    const right = 3 * row + (col + 1);

    const ul = 3 * (row - 1) + (col - 1);
    const ur = 3 * (row - 1) + (col + 1);
    const dl = 3 * (row + 1) + (col - 1);
    const dr = 3 * (row + 1) + (col + 1);

    const upPos = row - 1 > -1;
    const downPos = row + 1 < 3;
    const leftPos = col - 1 > -1;
    const rightPos = col + 1 < 3;

    const uWin = calculateWinner(simulateMoveGrain(squares.slice(), source, up)) !== null;
    const dWin = calculateWinner(simulateMoveGrain(squares.slice(), source, down)) !== null;
    const lWin = calculateWinner(simulateMoveGrain(squares.slice(), source, left)) !== null;
    const rWin = calculateWinner(simulateMoveGrain(squares.slice(), source, right)) !== null;

    const ulWin = calculateWinner(simulateMoveGrain(squares.slice(), source, ul)) !== null;
    const urWin = calculateWinner(simulateMoveGrain(squares.slice(), source, ur)) !== null;
    const dlWin = calculateWinner(simulateMoveGrain(squares.slice(), source, dl)) !== null;
    const drWin = calculateWinner(simulateMoveGrain(squares.slice(), source, dr)) !== null;
    
    if (squares[target] === null && (
        ((target === up && upPos) && (uWin || !mustVacate)) ||
        ((target === down && downPos) && (dWin || !mustVacate)) ||
        ((target === left && leftPos) && (lWin || !mustVacate)) ||
        ((target === right && rightPos) && (rWin || !mustVacate)) ||
        ((target === ul && upPos && leftPos) && (ulWin || !mustVacate)) ||
        ((target === ur && upPos && rightPos) && (urWin || !mustVacate)) ||
        ((target === dl && downPos && leftPos) && (dlWin || !mustVacate)) ||
        ((target === dr && downPos && rightPos) && (drWin || !mustVacate)))) {
      return true;
    } else {
      return false;
    }
  }

  function simulateMoveGrain(squareCtr, source, destination) {
    squareCtr[destination] = squareCtr[source];
    squareCtr[source] = null;
    return squareCtr;
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
  const [selectedGrain, setSelectedGrain] = useState(-1);

  function handleGrain(selection) {
    setSelectedGrain(selection);
  }

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
    setSelectedGrain(-1);
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
        <Board xIsNext={xIsNext} 
               squares={currentSquares} 
               onPlay={handlePlay} 
               move={currentMove}
               grain={selectedGrain}
               onGrain={handleGrain} />
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