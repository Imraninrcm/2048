let board;
let score = 0;
let rows = 4;
let columns = 4;

const start = document.querySelector("#start");
const reset = document.querySelector("#reset");
const instruction = document.querySelector("#instruction");

start.addEventListener("click", () => {
  sound("buttonClick.mp3");
  // Clear the existing board
  const boardElement = document.getElementById("board");
  while (boardElement.firstChild) {
    boardElement.removeChild(boardElement.firstChild);
  }
  setGame();
  instruction.innerText = "Click reset any time to fresh start the game";
});

reset.addEventListener("click", () => {
  sound("buttonClick.mp3");
  resetGame();
  instruction.innerText = "Click start to play";
});

function setGame() {
  board = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      let tile = document.createElement("div");
      tile.id = r.toString() + "-" + c.toString();
      let num = board[r][c];
      updateTile(tile, num);
      document.getElementById("board").append(tile);
    }
  }
  //create 2 to begin the game
  setTwo();
  setTwo();
}

function updateTile(tile, num) {
  tile.innerText = "";
  tile.classList.value = ""; //clear the classList
  tile.classList.add("tile");
  if (num > 0) {
    tile.innerText = num.toString();
    if (num <= 4096) {
      tile.classList.add("x" + num.toString());
    } else {
      tile.classList.add("x8192");
    }
  }
}

document.addEventListener("keyup", (e) => {
  let moved = false;
  if (e.code == "ArrowLeft") {
    moved = slideLeft();
  } else if (e.code == "ArrowRight") {
    moved = slideRight();
  } else if (e.code == "ArrowUp") {
    moved = slideUp();
  } else if (e.code == "ArrowDown") {
    moved = slideDown();
  }

  if (moved) {
    sound("tileMerge.mp3");
    setTwo();
    document.getElementById("score").innerText = score;
  }

  if (!hasEmptyTile() && noPossibleMoves()) {
    gameOver();
  }
});

function filterZero(row) {
  return row.filter((num) => num != 0); //create new array of all nums != 0
}

function slide(row) {
  //[0, 2, 2, 2]
  row = filterZero(row); //[2, 2, 2]
  for (let i = 0; i < row.length - 1; i++) {
    if (row[i] == row[i + 1]) {
      row[i] *= 2;
      row[i + 1] = 0;
      score += row[i];
    }
  } //[4, 0, 2]
  row = filterZero(row); //[4, 2]
  //add zeroes
  while (row.length < columns) {
    row.push(0);
  } //[4, 2, 0, 0]
  return row;
}

function slideLeft() {
  let moved = false;
  for (let r = 0; r < rows; r++) {
    let row = board[r];
    let originalRow = [...row];
    row = slide(row);
    board[r] = row;
    for (let c = 0; c < columns; c++) {
      let tile = document.getElementById(r.toString() + "-" + c.toString());
      let num = board[r][c];
      updateTile(tile, num);
    }
    if (JSON.stringify(originalRow) !== JSON.stringify(row)) {
      moved = true;
    }
  }
  return moved;
}

function slideRight() {
  let moved = false;
  for (let r = 0; r < rows; r++) {
    let row = board[r]; //[0, 2, 2, 2]
    let originalRow = [...row];
    row.reverse(); //[2, 2, 2, 0]
    row = slide(row); //[4, 2, 0, 0]
    board[r] = row.reverse(); //[0, 0, 2, 4];
    for (let c = 0; c < columns; c++) {
      let tile = document.getElementById(r.toString() + "-" + c.toString());
      let num = board[r][c];
      updateTile(tile, num);
    }
    if (JSON.stringify(originalRow) !== JSON.stringify(board[r])) {
      moved = true;
    }
  }
  return moved;
}

function slideUp() {
  let moved = false;
  for (let c = 0; c < columns; c++) {
    let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
    let originalRow = [...row];
    row = slide(row);
    for (let r = 0; r < rows; r++) {
      board[r][c] = row[r];
      let tile = document.getElementById(r.toString() + "-" + c.toString());
      let num = board[r][c];
      updateTile(tile, num);
    }
    if (JSON.stringify(originalRow) !== JSON.stringify(row)) {
      moved = true;
    }
  }
  return moved;
}

function slideDown() {
  let moved = false;
  for (let c = 0; c < columns; c++) {
    let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
    let originalRow = [...row];
    row.reverse();
    row = slide(row);
    row.reverse();
    for (let r = 0; r < rows; r++) {
      board[r][c] = row[r];
      let tile = document.getElementById(r.toString() + "-" + c.toString());
      let num = board[r][c];
      updateTile(tile, num);
    }
    if (
      JSON.stringify(originalRow) !== JSON.stringify(board.map((row) => row[c]))
    ) {
      moved = true;
    }
  }
  return moved;
}

function setTwo() {
  if (!hasEmptyTile()) {
    return;
  }
  let found = false;
  while (!found) {
    //find random row and column to place a 2 in
    let r = Math.floor(Math.random() * rows);
    let c = Math.floor(Math.random() * columns);
    if (board[r][c] == 0) {
      board[r][c] = 2;
      let tile = document.getElementById(r.toString() + "-" + c.toString());
      tile.innerText = "2";
      tile.classList.add("x2");
      found = true;
    }
  }
}

function hasEmptyTile() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      if (board[r][c] == 0) {
        //at least one zero in the board
        return true;
      }
    }
  }
  return false;
}

function noPossibleMoves() {
  // Check for possible moves in all directions
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      let currentTile = board[r][c];
      // Check right
      if (
        c < columns - 1 &&
        (currentTile == board[r][c + 1] || board[r][c + 1] == 0)
      ) {
        return false;
      }
      // Check down
      if (
        r < rows - 1 &&
        (currentTile == board[r + 1][c] || board[r + 1][c] == 0)
      ) {
        return false;
      }
      // Check left
      if (c > 0 && (currentTile == board[r][c - 1] || board[r][c - 1] == 0)) {
        return false;
      }
      // Check up
      if (r > 0 && (currentTile == board[r - 1][c] || board[r - 1][c] == 0)) {
        return false;
      }
    }
  }
  return true;
}

function gameOver() {
  sound("gameOver.mp3");
  alert("Game Over! Your score is: " + score);
  resetGame();
}

function resetGame() {
  // Reset the board array
  board = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  // Reset the score
  score = 0;
  document.getElementById("score").innerText = score;

  // Clear the UI board
  const boardElement = document.getElementById("board");
  while (boardElement.firstChild) {
    boardElement.removeChild(boardElement.firstChild);
  }
}

function sound(src) {
  const audio = new Audio();
  audio.src = src;
  audio.play();
}
