import test from "node:test";
import assert from "node:assert/strict";
import {
  FRUIT_DEFS,
  createInitialState,
  getDirection,
  placeFood,
  setDirection,
  stepGame,
} from "../src/snakeLogic.js";

function randomFrom(values, fallback = 0) {
  let index = 0;
  return () => {
    if (index >= values.length) {
      return fallback;
    }
    const value = values[index];
    index += 1;
    return value;
  };
}

function hasPoint(list, point) {
  return list.some((item) => item.x === point.x && item.y === point.y);
}

test("initial state spawns three fruits (banana, apple, strawberry)", () => {
  const state = createInitialState({ rows: 10, cols: 10, random: () => 0 });
  const types = state.fruits.map((fruit) => fruit.type).sort();
  assert.deepEqual(types, ["apple", "banana", "strawberry"]);
});

test("moves one cell when no fruit is eaten", () => {
  const state = {
    rows: 5,
    cols: 5,
    snake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 },
    ],
    direction: getDirection("right"),
    fruits: [{ type: "banana", x: 4, y: 4 }],
    score: 0,
    skulls: [],
    isAlive: true,
    isPaused: false,
    won: false,
  };

  const next = stepGame(state, () => 0);
  assert.equal(next.snake.length, 3);
  assert.deepEqual(next.snake[0], { x: 3, y: 2 });
});

test("banana grows by 1 and adds 1 skull", () => {
  const state = {
    rows: 5,
    cols: 5,
    snake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 },
    ],
    direction: getDirection("right"),
    fruits: [{ type: "banana", x: 3, y: 2 }],
    score: 0,
    skulls: [],
    isAlive: true,
    isPaused: false,
    won: false,
  };

  const next = stepGame(state, () => 0);
  assert.equal(FRUIT_DEFS.banana.growth, 1);
  assert.equal(FRUIT_DEFS.banana.addSkulls, 1);
  assert.equal(next.snake.length, 4);
  assert.equal(next.skulls.length, 1);
  assert.equal(next.score, 1);
});

test("eating one fruit respawns all three fruits", () => {
  const oldApple = { x: 4, y: 4 };
  const oldStrawberry = { x: 0, y: 4 };
  const state = {
    rows: 6,
    cols: 6,
    snake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 },
    ],
    direction: getDirection("right"),
    fruits: [
      { type: "banana", x: 3, y: 2 },
      { type: "apple", ...oldApple },
      { type: "strawberry", ...oldStrawberry },
    ],
    score: 0,
    skulls: [],
    isAlive: true,
    isPaused: false,
    won: false,
  };

  const next = stepGame(state, () => 0);
  const types = next.fruits.map((fruit) => fruit.type).sort();

  assert.deepEqual(types, ["apple", "banana", "strawberry"]);
  assert.equal(hasPoint(next.fruits, oldApple), false);
  assert.equal(hasPoint(next.fruits, oldStrawberry), false);
});

test("apple grows by 2 and adds 2 skulls", () => {
  const state = {
    rows: 5,
    cols: 5,
    snake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 },
    ],
    direction: getDirection("right"),
    fruits: [{ type: "apple", x: 3, y: 2 }],
    score: 0,
    skulls: [],
    isAlive: true,
    isPaused: false,
    won: false,
  };

  const next = stepGame(state, () => 0);
  assert.equal(FRUIT_DEFS.apple.growth, 2);
  assert.equal(FRUIT_DEFS.apple.addSkulls, 2);
  assert.equal(next.snake.length, 5);
  assert.equal(next.skulls.length, 2);
  assert.equal(next.score, 1);
});

test("strawberry grows by 3 and adds 3 skulls", () => {
  const state = {
    rows: 6,
    cols: 6,
    snake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 },
    ],
    direction: getDirection("right"),
    fruits: [{ type: "strawberry", x: 3, y: 2 }],
    score: 0,
    skulls: [],
    isAlive: true,
    isPaused: false,
    won: false,
  };

  const next = stepGame(state, randomFrom([0, 0, 0, 0, 0, 0]));
  assert.equal(FRUIT_DEFS.strawberry.growth, 3);
  assert.equal(FRUIT_DEFS.strawberry.addSkulls, 3);
  assert.equal(next.snake.length, 6);
  assert.equal(next.skulls.length, 3);
  assert.equal(next.score, 1);
});

test("wraps to opposite side on wall crossing", () => {
  const state = {
    rows: 4,
    cols: 4,
    snake: [
      { x: 3, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 1 },
    ],
    direction: getDirection("right"),
    fruits: [{ type: "banana", x: 0, y: 0 }],
    score: 0,
    skulls: [],
    isAlive: true,
    isPaused: false,
    won: false,
  };

  const next = stepGame(state, () => 0);
  assert.equal(next.isAlive, true);
  assert.deepEqual(next.snake[0], { x: 0, y: 1 });
});

test("sets game over on self collision", () => {
  const state = {
    rows: 5,
    cols: 5,
    snake: [
      { x: 2, y: 2 },
      { x: 2, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 1, y: 3 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 3, y: 2 },
      { x: 3, y: 1 },
    ],
    direction: getDirection("up"),
    fruits: [{ type: "banana", x: 4, y: 4 }],
    score: 0,
    skulls: [],
    isAlive: true,
    isPaused: false,
    won: false,
  };

  const next = stepGame(state, () => 0);
  assert.equal(next.isAlive, false);
});

test("sets game over on skull collision", () => {
  const state = {
    rows: 5,
    cols: 5,
    snake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 },
    ],
    direction: getDirection("right"),
    fruits: [{ type: "banana", x: 0, y: 0 }],
    score: 0,
    skulls: [{ x: 3, y: 2 }],
    isAlive: true,
    isPaused: false,
    won: false,
  };

  const next = stepGame(state, () => 0);
  assert.equal(next.isAlive, false);
});

test("food placement avoids snake, skulls and fruits", () => {
  const snake = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
  ];
  const skulls = [{ x: 0, y: 1 }];
  const fruits = [{ type: "banana", x: 1, y: 1 }];

  const food = placeFood({
    rows: 2,
    cols: 3,
    snake,
    skulls,
    fruits,
    random: () => 0,
  });

  assert.deepEqual(food, { x: 2, y: 1 });
});

test("does not allow immediate reverse direction", () => {
  const state = createInitialState({ rows: 10, cols: 10, random: () => 0 });
  const reversed = setDirection(state, getDirection("left"));
  assert.deepEqual(reversed.direction, getDirection("right"));
});
