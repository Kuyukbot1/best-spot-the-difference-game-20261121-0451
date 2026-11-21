// The screenshot scenes behind ?shot=start|play|almost|win. Each one plays the
// real rules forward from a fresh round — the stager clicks the real
// differences through clickAt(), at the real panel coordinates — so the frame
// is what a short game really looks like, and the same seed always gives the
// same frame. The timer is backdated so the clock reads a plausible value.

import { DIFFERENCES, PANEL } from './config.js';
import { SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN, clickAt, startRound } from './game.js';

/** Logical coordinates of a difference's centre on the LEFT picture. */
function leftPoint(d) {
  return { x: PANEL.leftX + d.x, y: PANEL.y + d.y };
}

/** Click the named differences, in order, through the real rules. */
function findIds(game, ids, now) {
  for (const id of ids) {
    const d = DIFFERENCES.find((item) => item.id === id);
    const point = leftPoint(d);
    clickAt(game, point.x, point.y, now);
  }
}

/**
 * Set `game` to the named scene and return the screen to draw. `now` is the
 * performance clock at staging time.
 */
export function stageShot(name, game, now) {
  startRound(game, now);
  if (name === 'start') {
    // Fresh game on the title screen: both pictures, counter on 8.
    game.screen = SCREEN_TITLE;
    return { screen: SCREEN_TITLE };
  }
  if (name === 'play') {
    findIds(game, ['moon', 'cat', 'basket'], now);
    game.startedAt = now - 47000; // clock reads 00:47
    game.elapsedMs = 47000;
    return { screen: SCREEN_PLAY };
  }
  if (name === 'almost') {
    findIds(game, ['moon', 'cat', 'basket', 'lantern', 'window', 'awning'], now);
    game.misses = 1;
    game.startedAt = now - 151000; // clock reads 02:31
    game.elapsedMs = 151000;
    return { screen: SCREEN_PLAY };
  }
  // 'win' (and anything else): all eight found, win screen up. The clock is
  // backdated first, so the win records the staged time as its finish.
  game.startedAt = now - 192000; // clock reads 03:12
  game.elapsedMs = 192000;
  findIds(game, DIFFERENCES.map((d) => d.id), now);
  game.misses = 2;
  game.screen = SCREEN_WIN;
  return { screen: SCREEN_WIN };
}
