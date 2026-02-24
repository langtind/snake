# Snake

Browser-based snake game built with vanilla JavaScript. No frameworks, no build step.

## Project structure

```
index.html          Entry point. 20x20 grid board, score display, controls, death overlay.
styles.css          All styling. Rainbow snake animation, death screen with flicker/shake effects.
src/main.js         DOM rendering, input handling, game loop (140ms tick via setInterval).
src/snakeLogic.js   Pure game logic. Immutable state, all functions return new state objects.
assets/youre-dead.svg  Death screen image.
test/snakeLogic.test.js  Unit tests for game logic.
```

## Game mechanics

- **Grid**: 20x20 cells.
- **Fruits**: Three types always present on the board simultaneously:
  - Banana: +1 growth, spawns 1 skull
  - Apple: +2 growth, spawns 2 skulls
  - Strawberry: +3 growth, spawns 3 skulls
- **Skulls**: Permanent obstacles placed randomly when fruit is eaten. Hitting one kills the snake.
- **Wall mode**: Toggle between teleport (wrap-around, default) and deadly (hit wall = death).
- **Win condition**: Snake + skulls + fruits fill the entire board.
- **Score**: Increments by 1 per fruit eaten regardless of type.

## Architecture

All game state lives in a single immutable object returned by `createInitialState()`:

```js
{ rows, cols, snake, direction, fruits, score, skulls, isAlive, isPaused, won, wallMode }
```

Key exports from `src/snakeLogic.js`:
- `createInitialState(options)` - New game state. Options: `{ rows, cols, wallMode, random }`.
- `setDirection(state, direction)` - Returns state with new direction (blocks 180-degree reversal).
- `stepGame(state, random)` - Advances one tick. Handles movement, collision, eating, skull spawning.
- `togglePause(state)` - Toggles pause.
- `getDirection(name)` - Maps `"up"/"down"/"left"/"right"` to `{x, y}` vectors.
- `placeFood(options)` / `placeSkull(options)` - Random cell placement utilities.

`src/main.js` handles rendering and input only. It reads state and applies CSS classes (`snake`, `head`, `food-banana`, `food-apple`, `food-strawberry`, `skull`) to grid cells.

## Controls

- Arrow keys or WASD for direction.
- Space to pause/resume.
- On-screen buttons for touch/mouse.

## Running locally

The game uses ES modules (`<script type="module">`), so opening `index.html` directly as a file won't work — browsers block module imports from `file://`. You need a local HTTP server.

**Any of these work:**

```bash
# Python (pre-installed on macOS/Linux, available on Windows)
python -m http.server 8000

# Node.js
npx serve .

# VS Code
# Install "Live Server" extension, right-click index.html → "Open with Live Server"
```

Then open `http://localhost:8000` (or the port shown).

**On Windows specifically:** Python or `npx serve` are the easiest options. If using Codex or a cloud environment, use whatever local server is available — the only requirement is serving files over HTTP.

## Deployed

Live via GitHub Pages.
