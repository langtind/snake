const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export const FRUIT_DEFS = {
  banana: { growth: 1, addSkulls: 1 },
  apple: { growth: 2, addSkulls: 2 },
  strawberry: { growth: 3, addSkulls: 3 },
};

const FRUIT_ORDER = ["banana", "apple", "strawberry"];

function positionsEqual(a, b) {
  return a.x === b.x && a.y === b.y;
}

function isOppositeDirection(current, next) {
  return current.x + next.x === 0 && current.y + next.y === 0;
}

function coordKey(point) {
  return `${point.x},${point.y}`;
}

function buildOccupiedSet({ snake, skulls = [], fruits = [] }) {
  const occupied = new Set();
  for (const segment of snake) {
    occupied.add(coordKey(segment));
  }
  for (const skull of skulls) {
    occupied.add(coordKey(skull));
  }
  for (const fruit of fruits) {
    occupied.add(coordKey(fruit));
  }
  return occupied;
}

function placeRandomCell({
  rows,
  cols,
  snake,
  skulls = [],
  fruits = [],
  random = Math.random,
}) {
  const occupied = buildOccupiedSet({ snake, skulls, fruits });
  const empty = [];

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        empty.push({ x, y });
      }
    }
  }

  if (empty.length === 0) {
    return null;
  }

  const index = Math.floor(random() * empty.length);
  return empty[index];
}

function spawnFruitOfType({
  type,
  rows,
  cols,
  snake,
  skulls = [],
  fruits = [],
  random = Math.random,
}) {
  const position = placeRandomCell({
    rows,
    cols,
    snake,
    skulls,
    fruits,
    random,
  });

  if (!position) {
    return null;
  }

  return { type, ...position };
}

function spawnInitialFruits({ rows, cols, snake, skulls = [], random = Math.random }) {
  const fruits = [];

  for (const type of FRUIT_ORDER) {
    const fruit = spawnFruitOfType({
      type,
      rows,
      cols,
      snake,
      skulls,
      fruits,
      random,
    });
    if (!fruit) {
      break;
    }
    fruits.push(fruit);
  }

  return fruits;
}

function getFruitGrowth(type) {
  return FRUIT_DEFS[type]?.growth ?? 0;
}

function getFruitSkullCount(type) {
  return FRUIT_DEFS[type]?.addSkulls ?? 0;
}

export function getDirection(name) {
  return DIRECTIONS[name] ?? null;
}

export function createInitialState(options = {}) {
  const rows = options.rows ?? 20;
  const cols = options.cols ?? 20;
  const random = options.random ?? Math.random;
  const centerX = Math.floor(cols / 2);
  const centerY = Math.floor(rows / 2);

  const snake = [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY },
  ];
  const skulls = [];
  const fruits = spawnInitialFruits({ rows, cols, snake, skulls, random });

  return {
    rows,
    cols,
    snake,
    direction: DIRECTIONS.right,
    fruits,
    score: 0,
    skulls,
    isAlive: true,
    isPaused: false,
    won: false,
  };
}

export function setDirection(state, nextDirection) {
  if (!nextDirection) {
    return state;
  }
  if (isOppositeDirection(state.direction, nextDirection)) {
    return state;
  }

  return {
    ...state,
    direction: nextDirection,
  };
}

export function togglePause(state) {
  if (!state.isAlive) {
    return state;
  }

  return {
    ...state,
    isPaused: !state.isPaused,
  };
}

export function stepGame(state, random = Math.random) {
  if (!state.isAlive || state.isPaused) {
    return state;
  }

  const head = state.snake[0];
  const movedHead = {
    x: head.x + state.direction.x,
    y: head.y + state.direction.y,
  };
  const nextHead = {
    x: (movedHead.x + state.cols) % state.cols,
    y: (movedHead.y + state.rows) % state.rows,
  };

  const skulls = state.skulls ?? [];
  const fruits = state.fruits ?? [];

  const hitSkull = skulls.some((skull) => positionsEqual(skull, nextHead));
  if (hitSkull) {
    return {
      ...state,
      isAlive: false,
    };
  }

  const eatenIndex = fruits.findIndex((fruit) => positionsEqual(fruit, nextHead));
  const eatenFruit = eatenIndex >= 0 ? fruits[eatenIndex] : null;
  const growth = eatenFruit ? getFruitGrowth(eatenFruit.type) : 0;

  const bodyToCheck = growth > 0 ? state.snake : state.snake.slice(0, -1);
  const hitSelf = bodyToCheck.some((segment) => positionsEqual(segment, nextHead));
  if (hitSelf) {
    return {
      ...state,
      isAlive: false,
    };
  }

  const nextSnake = [nextHead, ...state.snake];
  if (growth === 0) {
    nextSnake.pop();
  } else if (growth > 1) {
    const tail = nextSnake[nextSnake.length - 1];
    for (let i = 0; i < growth - 1; i += 1) {
      nextSnake.push({ ...tail });
    }
  }

  if (!eatenFruit) {
    return {
      ...state,
      snake: nextSnake,
    };
  }

  const nextSkulls = [...skulls];
  const skullCount = getFruitSkullCount(eatenFruit.type);
  for (let i = 0; i < skullCount; i += 1) {
    const skull = placeRandomCell({
      rows: state.rows,
      cols: state.cols,
      snake: nextSnake,
      skulls: nextSkulls,
      fruits: [],
      random,
    });
    if (!skull) {
      break;
    }
    nextSkulls.push(skull);
  }

  const nextFruits = spawnInitialFruits({
    rows: state.rows,
    cols: state.cols,
    snake: nextSnake,
    skulls: nextSkulls,
    random,
  });

  const totalCells = state.rows * state.cols;
  const occupiedNow = nextSnake.length + nextSkulls.length + nextFruits.length;
  const won = occupiedNow >= totalCells;

  return {
    ...state,
    snake: nextSnake,
    fruits: nextFruits,
    skulls: nextSkulls,
    score: state.score + 1,
    won,
    isAlive: won ? false : state.isAlive,
  };
}

export function placeFood({
  rows,
  cols,
  snake,
  skulls = [],
  fruits = [],
  random = Math.random,
}) {
  return placeRandomCell({
    rows,
    cols,
    snake,
    skulls,
    fruits,
    random,
  });
}

export function placeSkull({
  rows,
  cols,
  snake,
  skulls = [],
  fruits = [],
  random = Math.random,
}) {
  return placeRandomCell({
    rows,
    cols,
    snake,
    skulls,
    fruits,
    random,
  });
}
