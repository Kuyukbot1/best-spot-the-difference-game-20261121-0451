// Lantern Lane — Spot the Difference.
// Every tuning number, colour and difference in one place. The playfield is a
// fixed 1280x720 logical area; the renderer scales it to the window, so no rule
// below depends on the screen size.

export const FIELD = { width: 1280, height: 720 };

/** Header band (title, counter, timer, buttons) and footer band (hints). */
export const HEADER_H = 72;
export const FOOTER_Y = 664;

/** The two picture panels: same size, side by side. */
export const PANEL = { width: 600, height: 576, y: 84, leftX: 24, rightX: 656, gap: 32 };

/** How many differences a round hides, and how many hints a player gets. */
export const TOTAL_DIFFERENCES = 8;
export const HINTS_PER_ROUND = 3;

/** Click tolerance around a difference centre, in scene pixels. */
export const CLICK_RADIUS = 34;

/** A hint ring stays visible this long, in milliseconds. */
export const HINT_MS = 3000;

/** A wrong-click X stays visible this long, in milliseconds. */
export const WRONG_MS = 700;

/** Header buttons, in logical coordinates (hit-tested by the input layer). */
export const BUTTONS = {
  hint: { x: 880, y: 14, w: 96, h: 44, label: 'Hint (H)' },
  sound: { x: 984, y: 14, w: 96, h: 44, label: 'Sound: On' },
  restart: { x: 1088, y: 14, w: 96, h: 44, label: 'Restart (R)' },
};

/**
 * The eight planted differences. x/y are scene coordinates inside one panel
 * (panel-local, 600x576). `left` describes the left picture, `right` the right
 * one; the scene painter branches on exactly these ids and nothing else, so
 * the two pictures are identical apart from these eight spots.
 */
export const DIFFERENCES = [
  { id: 'moon', name: 'the moon', x: 500, y: 78, left: 'full moon', right: 'crescent moon' },
  { id: 'bird', name: 'the bird on the wire', x: 430, y: 50, left: 'bird perched', right: 'bird gone' },
  { id: 'lantern', name: 'the middle lantern', x: 300, y: 148, left: 'three lanterns', right: 'two lanterns' },
  { id: 'window', name: 'the upstairs window', x: 484, y: 297, left: 'window lit', right: 'window dark' },
  { id: 'awning', name: 'the shop awning', x: 300, y: 356, left: 'red awning', right: 'teal awning' },
  { id: 'cat', name: 'the cat in the window', x: 300, y: 415, left: 'cat sitting', right: 'cat gone' },
  { id: 'basket', name: 'the bicycle basket', x: 492, y: 476, left: 'basket fitted', right: 'basket gone' },
  { id: 'flowers', name: 'the potted flowers', x: 566, y: 492, left: 'red blooms', right: 'purple blooms' },
];

export const PALETTE = {
  backdrop: '#171223',
  header: '#221a33',
  panelFrame: '#3d3358',
  panelFrameFound: '#3fae6a',
  text: '#f4ead8',
  muted: '#b8a8cc',
  accent: '#ffb347',
  accentDark: '#e8825a',
  counterBg: '#2e2447',
  counterText: '#ffd98a',
  marker: '#37d67a',
  markerRing: '#eafff0',
  wrong: '#ff5d5d',
  hint: '#ffd94d',
  overlay: 'rgba(12, 8, 22, 0.72)',
  button: '#3a2d55',
  buttonHover: '#4a3a6d',
  win: '#37d67a',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best (fastest) win is kept between visits (this browser only). */
export const BEST_KEY = 'lantern-lane.best-ms';

/** Small deterministic generator, so the stars and cobbles land identically. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** mm:ss for a millisecond count. */
export function formatTime(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
