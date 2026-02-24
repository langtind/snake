# Agents

## Project overview

Browser-based snake game. Vanilla JavaScript, no frameworks, no build step, no dependencies.

## File structure

- `index.html` — Entry point. Loads styles and `src/main.js` as ES module.
- `styles.css` — All styling including animations (rainbow snake, death screen effects).
- `src/snakeLogic.js` — Pure game logic. Immutable state pattern: every function returns a new state object.
- `src/main.js` — DOM rendering, input handling, game loop (140ms tick).
- `assets/youre-dead.svg` — Death screen image.
- `test/snakeLogic.test.js` — Unit tests for game logic.

## Running locally

Requires a local HTTP server because the game uses ES modules (`<script type="module">`). Opening `index.html` directly via `file://` will fail.

```bash
python -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000`.

## Game state

All state is a single object:

```js
{ rows, cols, snake, direction, fruits, score, skulls, isAlive, isPaused, won, wallMode }
```

- `snake` — Array of `{x, y}` segments, head is index 0.
- `fruits` — Array of `{type, x, y}`. Types: `"banana"`, `"apple"`, `"strawberry"`.
- `skulls` — Array of `{x, y}` permanent obstacles.
- `direction` — `{x, y}` vector, one of `{0,-1}`, `{0,1}`, `{-1,0}`, `{1,0}`.
- `wallMode` — `"teleport"` (wrap-around) or `"deadly"` (hit wall = death).

## Key functions in `src/snakeLogic.js`

- `createInitialState({ rows, cols, wallMode, random })` — Creates new game state.
- `stepGame(state, random)` — Advances one tick. Handles movement, collision, fruit eating, skull spawning.
- `setDirection(state, direction)` — Sets direction (blocks 180-degree reversal).
- `togglePause(state)` — Toggles pause.
- `getDirection(name)` — Maps `"up"/"down"/"left"/"right"` to `{x, y}` vectors.

## Game rules

- 20x20 grid.
- Three fruit types always on the board: banana (+1 growth, +1 skull), apple (+2, +2), strawberry (+3, +3).
- Eating fruit spawns skulls randomly. Skulls are permanent — hitting one kills the snake.
- Score increments by 1 per fruit regardless of type.
- Win when snake + skulls + fruits fill the entire board.

## Testing

Tests are plain JS using Node's built-in test runner:

```bash
node --test test/snakeLogic.test.js
```

## Conventions

- No build tools or package managers.
- Pure functions for game logic — no side effects in `snakeLogic.js`.
- DOM manipulation only in `main.js`.
- CSS classes for rendering: `snake`, `head`, `food-banana`, `food-apple`, `food-strawberry`, `skull`.
