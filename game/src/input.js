// Mouse and keyboard input. Mouse clicks and the crosshair are converted from
// page pixels to the game's 1280x720 logical coordinates through the canvas
// bounding box, so the game plays at any window size. Arrow keys move the
// crosshair, Enter/Space clicks where it points, H hints, R restarts, M mutes.

import { FIELD, PANEL } from './config.js';

export const ACTION_CONFIRM = 1;
export const ACTION_HINT = 2;
export const ACTION_RESTART = 4;
export const ACTION_MUTE = 8;

const ARROW_STEP = 12;
const ARROW_FAST_STEP = 48;

/** Convert a pointer event on the canvas to logical game coordinates. */
function toLogical(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * FIELD.width,
    y: ((event.clientY - rect.top) / rect.height) * FIELD.height,
  };
}

export function createInput(canvas, game) {
  let actions = 0;
  let clicks = [];
  let hover = { x: -1, y: -1 };

  function moveCrosshair(dx, dy) {
    const cross = game.crosshair;
    cross.visible = true;
    cross.x = Math.min(FIELD.width - 4, Math.max(4, cross.x + dx));
    cross.y = Math.min(PANEL.y + PANEL.height - 4, Math.max(PANEL.y + 4, cross.y + dy));
  }

  canvas.addEventListener('pointermove', (event) => {
    const point = toLogical(canvas, event);
    hover = point;
    game.crosshair.x = point.x;
    game.crosshair.y = point.y;
    game.crosshair.visible = true;
  });

  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    clicks.push(toLogical(canvas, event));
  });

  canvas.addEventListener('pointerleave', () => {
    game.crosshair.visible = false;
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) {
      if (event.key.startsWith('Arrow')) event.preventDefault();
      return;
    }
    const step = event.shiftKey ? ARROW_FAST_STEP : ARROW_STEP;
    switch (event.key) {
      case 'ArrowLeft':
        moveCrosshair(-step, 0);
        event.preventDefault();
        break;
      case 'ArrowRight':
        moveCrosshair(step, 0);
        event.preventDefault();
        break;
      case 'ArrowUp':
        moveCrosshair(0, -step);
        event.preventDefault();
        break;
      case 'ArrowDown':
        moveCrosshair(0, step);
        event.preventDefault();
        break;
      case 'Enter':
      case ' ':
        actions |= ACTION_CONFIRM;
        event.preventDefault();
        break;
      case 'h':
      case 'H':
        actions |= ACTION_HINT;
        break;
      case 'r':
      case 'R':
        actions |= ACTION_RESTART;
        break;
      case 'm':
      case 'M':
        actions |= ACTION_MUTE;
        break;
      default:
        break;
    }
  });

  return {
    /** Clicks since the last take, as logical points. */
    takeClicks() {
      const taken = clicks;
      clicks = [];
      return taken;
    },
    /** One-shot actions since the last take. */
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    hover() {
      return hover;
    },
  };
}
