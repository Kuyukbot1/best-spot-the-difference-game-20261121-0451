// Lantern Lane rules: one round of spot-the-difference. Pure state and rules —
// no canvas, no DOM — so the screenshot stager and the live game run the
// exact same code path when a difference is found.
//
// Screens: 'title' -> 'play' -> 'win'. The timer runs while playing. A click
// on either picture is mapped into scene coordinates and tested against the
// unfound differences; the nearest one inside CLICK_RADIUS counts as found.

import {
  BEST_KEY,
  BUTTONS,
  CLICK_RADIUS,
  DIFFERENCES,
  FIELD,
  HINTS_PER_ROUND,
  HINT_MS,
  PANEL,
  TOTAL_DIFFERENCES,
  WRONG_MS,
} from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_WIN = 'win';

/** A fresh round, on the title screen. */
export function createGame(seed) {
  return {
    seed,
    screen: SCREEN_TITLE,
    found: new Set(),
    misses: 0,
    hintsLeft: HINTS_PER_ROUND,
    hint: null, // { id, until } while a hint ring is showing
    wrong: null, // { x, y, until } while a wrong-click X is showing
    startedAt: 0,
    elapsedMs: 0,
    finishedMs: 0,
    bestMs: readBest(),
    crosshair: { x: FIELD.width / 2, y: PANEL.y + PANEL.height / 2, visible: false },
    message: 'Find 8 differences between the two pictures.',
    muted: false,
    hoverButton: null,
  };
}

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best time then lasts this visit only.
  }
}

export function remaining(game) {
  return TOTAL_DIFFERENCES - game.found.size;
}

export function isWon(game) {
  return game.found.size >= TOTAL_DIFFERENCES;
}

/** Start (or restart) a round: clear the board, start the timer. */
export function startRound(game, now) {
  game.found = new Set();
  game.misses = 0;
  game.hintsLeft = HINTS_PER_ROUND;
  game.hint = null;
  game.wrong = null;
  game.startedAt = now;
  game.elapsedMs = 0;
  game.finishedMs = 0;
  game.screen = SCREEN_PLAY;
  game.message = 'Find 8 differences between the two pictures.';
}

/** Advance the clock; called every frame while playing. */
export function tick(game, now) {
  if (game.screen === SCREEN_PLAY) game.elapsedMs = now - game.startedAt;
  if (game.hint && now > game.hint.until) game.hint = null;
  if (game.wrong && now > game.wrong.until) game.wrong = null;
}

/**
 * Which panel (0 left, 1 right), if any, holds logical point (x, y)?
 * Returns null outside both pictures.
 */
export function panelAt(x, y) {
  if (y < PANEL.y || y > PANEL.y + PANEL.height) return null;
  if (x >= PANEL.leftX && x < PANEL.leftX + PANEL.width) return 0;
  if (x >= PANEL.rightX && x < PANEL.rightX + PANEL.width) return 1;
  return null;
}

/** Convert a logical point inside a panel to scene coordinates. */
export function toScene(panel, x, y) {
  const originX = panel === 0 ? PANEL.leftX : PANEL.rightX;
  return { x: x - originX, y: y - PANEL.y };
}

/** The nearest unfound difference to scene point (x, y), or null. */
export function nearestDifference(game, x, y) {
  let best = null;
  let bestDist = Infinity;
  for (const d of DIFFERENCES) {
    if (game.found.has(d.id)) continue;
    const dist = Math.hypot(d.x - x, d.y - y);
    if (dist <= CLICK_RADIUS && dist < bestDist) {
      best = d;
      bestDist = dist;
    }
  }
  return best;
}

/**
 * Click at logical (x, y) during play. Returns 'found' | 'miss' | 'ignored'.
 * A found difference is circled on both pictures at once.
 */
export function clickAt(game, x, y, now) {
  if (game.screen !== SCREEN_PLAY) return 'ignored';
  const panel = panelAt(x, y);
  if (panel === null) return 'ignored';
  const scene = toScene(panel, x, y);
  const hit = nearestDifference(game, scene.x, scene.y);
  if (hit) {
    game.found.add(hit.id);
    game.message = `Found ${hit.name}! ${remaining(game)} to go.`;
    if (isWon(game)) {
      game.screen = SCREEN_WIN;
      game.finishedMs = game.elapsedMs;
      if (game.bestMs === 0 || game.finishedMs < game.bestMs) {
        game.bestMs = game.finishedMs;
        saveBest(game.bestMs);
      }
      game.message = 'You found them all!';
    }
    return 'found';
  }
  game.misses += 1;
  game.wrong = { x, y, until: now + WRONG_MS };
  game.message = 'Not quite — that spot matches. Look closer!';
  return 'miss';
}

/** Spend one hint: ring an unfound difference for a few seconds. */
export function useHint(game, now) {
  if (game.screen !== SCREEN_PLAY || game.hintsLeft <= 0) return null;
  const left = DIFFERENCES.filter((d) => !game.found.has(d.id));
  if (left.length === 0) return null;
  const pick = left[Math.floor(Math.random() * left.length)];
  game.hintsLeft -= 1;
  game.hint = { id: pick.id, until: now + HINT_MS };
  game.message = `Hint: look near ${pick.name}…`;
  return pick;
}

/** Which header button, if any, holds logical point (x, y)? */
export function buttonAt(x, y) {
  for (const [name, b] of Object.entries(BUTTONS)) {
    if (x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) return name;
  }
  return null;
}
