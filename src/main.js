import {
  createInitialState,
  getDirection,
  setDirection,
  stepGame,
  togglePause,
} from "./snakeLogic.js";

const ROWS = 20;
const COLS = 20;
const TICK_MS = 140;

const boardEl = document.querySelector("#board");
const scoreEl = document.querySelector("#score");
const statusEl = document.querySelector("#status");
const restartBtn = document.querySelector("#restart-btn");
const pauseBtn = document.querySelector("#pause-btn");
const replayBtn = document.querySelector("#replay-btn");
const controlButtons = document.querySelectorAll("[data-dir]");
const deathOverlayEl = document.querySelector("#death-overlay");
const wallToggleEl = document.querySelector("#wall-toggle");

let state = createInitialState({ rows: ROWS, cols: COLS });
const cells = [];

function toIndex(x, y) {
  return y * COLS + x;
}

function buildGrid() {
  boardEl.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
  boardEl.style.gridTemplateRows = `repeat(${ROWS}, 1fr)`;

  const fragment = document.createDocumentFragment();
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.setAttribute("role", "gridcell");
      cells.push(cell);
      fragment.appendChild(cell);
    }
  }
  boardEl.appendChild(fragment);
}

function applyDirection(name) {
  state = setDirection(state, getDirection(name));
}

function render() {
  for (const cell of cells) {
    cell.classList.remove(
      "snake",
      "head",
      "food",
      "food-banana",
      "food-apple",
      "food-strawberry",
      "skull",
    );
  }

  for (const skull of state.skulls ?? []) {
    const skullCell = cells[toIndex(skull.x, skull.y)];
    if (skullCell) {
      skullCell.classList.add("skull");
    }
  }

  state.snake.forEach((segment, index) => {
    const cell = cells[toIndex(segment.x, segment.y)];
    if (!cell) {
      return;
    }
    cell.classList.add("snake");
    if (index === 0) {
      cell.classList.add("head");
    }
  });

  for (const fruit of state.fruits ?? []) {
    const fruitCell = cells[toIndex(fruit.x, fruit.y)];
    if (fruitCell) {
      fruitCell.classList.add("food", `food-${fruit.type}`);
    }
  }

  scoreEl.textContent = String(state.score);

  if (!state.isAlive && state.won) {
    statusEl.textContent = "You win";
  } else if (!state.isAlive) {
    statusEl.textContent = "Game over";
  } else if (state.isPaused) {
    statusEl.textContent = "Paused";
  } else {
    statusEl.textContent = "Running";
  }

  pauseBtn.textContent = state.isPaused ? "Resume" : "Pause";

  const isDead = !state.isAlive && !state.won;
  deathOverlayEl.classList.toggle("active", isDead);
  document.body.classList.toggle("death-active", isDead);
}

function getWallMode() {
  return wallToggleEl.checked ? "deadly" : "teleport";
}

function resetGame() {
  state = createInitialState({ rows: ROWS, cols: COLS, wallMode: getWallMode() });
  render();
}

function tick() {
  state = stepGame(state);
  render();
}

function onKeyDown(event) {
  const key = event.key.toLowerCase();
  if (key === "arrowup" || key === "w") {
    event.preventDefault();
    applyDirection("up");
    return;
  }
  if (key === "arrowdown" || key === "s") {
    event.preventDefault();
    applyDirection("down");
    return;
  }
  if (key === "arrowleft" || key === "a") {
    event.preventDefault();
    applyDirection("left");
    return;
  }
  if (key === "arrowright" || key === "d") {
    event.preventDefault();
    applyDirection("right");
    return;
  }
  if (key === " ") {
    event.preventDefault();
    state = togglePause(state);
    render();
  }
}

buildGrid();
render();
setInterval(tick, TICK_MS);

document.addEventListener("keydown", onKeyDown);

restartBtn.addEventListener("click", resetGame);
replayBtn.addEventListener("click", resetGame);
pauseBtn.addEventListener("click", () => {
  state = togglePause(state);
  render();
});

for (const button of controlButtons) {
  button.addEventListener("click", () => {
    applyDirection(button.dataset.dir);
    render();
  });
}

wallToggleEl.addEventListener("change", () => {
  state = { ...state, wallMode: getWallMode() };
});
