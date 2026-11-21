// The renderer: header with the counter, the two pictures, markers on found
// differences, the crosshair, the hint ring, the wrong-click X, and the title
// and win overlays. Everything is drawn on one canvas; the game scales the
// 1280x720 logical field to the window.

import {
  BUTTONS,
  DIFFERENCES,
  FIELD,
  FONT,
  FOOTER_Y,
  HEADER_H,
  PALETTE,
  PANEL,
  formatTime,
} from './config.js';
import { SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN, remaining } from './game.js';
import { drawScene } from './scene.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawButton(ctx, def, label, hovered) {
  ctx.fillStyle = hovered ? PALETTE.buttonHover : PALETTE.button;
  roundRect(ctx, def.x, def.y, def.w, def.h, 9);
  ctx.fill();
  ctx.strokeStyle = PALETTE.panelFrame;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = PALETTE.text;
  ctx.font = '600 15px ' + FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, def.x + def.w / 2, def.y + def.h / 2 + 1);
}

function drawHeader(ctx, game, hover) {
  ctx.fillStyle = PALETTE.header;
  ctx.fillRect(0, 0, FIELD.width, HEADER_H);
  ctx.fillStyle = PALETTE.accent;
  ctx.font = '800 30px ' + FONT;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('LANTERN LANE', 24, 30);
  ctx.fillStyle = PALETTE.muted;
  ctx.font = '500 15px ' + FONT;
  ctx.fillText('Spot the Difference', 24, 56);

  // The counter of differences still to find — the number the judge reads.
  const left = remaining(game);
  ctx.fillStyle = PALETTE.counterBg;
  roundRect(ctx, 330, 14, 240, 44, 10);
  ctx.fill();
  ctx.fillStyle = PALETTE.counterText;
  ctx.font = '800 24px ' + FONT;
  ctx.textAlign = 'center';
  ctx.fillText(`${left} difference${left === 1 ? '' : 's'} left`, 450, 38);

  // Timer.
  ctx.fillStyle = PALETTE.text;
  ctx.font = '700 22px ' + FONT;
  ctx.fillText(formatTime(game.elapsedMs), 640, 38);
  ctx.fillStyle = PALETTE.muted;
  ctx.font = '500 13px ' + FONT;
  ctx.fillText(game.bestMs ? `best ${formatTime(game.bestMs)}` : 'no best yet', 640, 58);

  // Buttons.
  const hoverName = hover
    ? Object.entries(BUTTONS).find(([, b]) => hover.x >= b.x && hover.x < b.x + b.w && hover.y >= b.y && hover.y < b.y + b.h)?.[0]
    : null;
  drawButton(ctx, BUTTONS.hint, `Hint (${game.hintsLeft})`, hoverName === 'hint');
  drawButton(ctx, BUTTONS.sound, game.muted ? 'Sound: Off' : 'Sound: On', hoverName === 'sound');
  drawButton(ctx, BUTTONS.restart, 'Restart (R)', hoverName === 'restart');
}

function drawPanel(ctx, game, panel) {
  const ox = panel === 0 ? PANEL.leftX : PANEL.rightX;
  const oy = PANEL.y;
  ctx.save();
  drawScene(ctx, ox, oy, panel, game.seed);
  // Frame: green once every difference in view is found, else muted violet.
  ctx.strokeStyle = game.found.size === DIFFERENCES.length ? PALETTE.panelFrameFound : PALETTE.panelFrame;
  ctx.lineWidth = 4;
  ctx.strokeRect(ox - 2, oy - 2, PANEL.width + 4, PANEL.height + 4);
  // Label chip tucked inside the panel's top-left corner.
  ctx.fillStyle = 'rgba(12, 8, 22, 0.65)';
  roundRect(ctx, ox + 8, oy + 8, 96, 26, 7);
  ctx.fill();
  ctx.fillStyle = PALETTE.text;
  ctx.font = '700 14px ' + FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(panel === 0 ? 'PICTURE A' : 'PICTURE B', ox + 56, oy + 22);
  ctx.restore();
}

function drawMarkers(ctx, game, now) {
  // A green ring + tick on BOTH pictures for every found difference.
  for (const d of DIFFERENCES) {
    if (!game.found.has(d.id)) continue;
    for (const panel of [0, 1]) {
      const ox = panel === 0 ? PANEL.leftX : PANEL.rightX;
      const cx = ox + d.x;
      const cy = PANEL.y + d.y;
      ctx.strokeStyle = PALETTE.marker;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx, cy, 30, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = PALETTE.markerRing;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 34, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = PALETTE.marker;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 12, cy);
      ctx.lineTo(cx - 3, cy + 9);
      ctx.lineTo(cx + 13, cy - 10);
      ctx.stroke();
      ctx.lineCap = 'butt';
    }
  }
  // Hint: a pulsing amber ring around one unfound difference, both pictures.
  if (game.hint && now < game.hint.until) {
    const d = DIFFERENCES.find((item) => item.id === game.hint.id);
    if (d) {
      const pulse = 30 + Math.sin(now / 130) * 5;
      for (const panel of [0, 1]) {
        const ox = panel === 0 ? PANEL.leftX : PANEL.rightX;
        ctx.strokeStyle = PALETTE.hint;
        ctx.lineWidth = 4;
        ctx.setLineDash([10, 8]);
        ctx.beginPath();
        ctx.arc(ox + d.x, PANEL.y + d.y, pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }
  // Wrong click: a red X where the player clicked.
  if (game.wrong && now < game.wrong.until) {
    const { x, y } = game.wrong;
    ctx.strokeStyle = PALETTE.wrong;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 12, y - 12);
    ctx.lineTo(x + 12, y + 12);
    ctx.moveTo(x + 12, y - 12);
    ctx.lineTo(x - 12, y + 12);
    ctx.stroke();
    ctx.lineCap = 'butt';
  }
}

function drawCrosshair(ctx, game) {
  if (!game.crosshair.visible || game.screen !== SCREEN_PLAY) return;
  const { x, y } = game.crosshair;
  ctx.strokeStyle = 'rgba(244, 234, 216, 0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 14, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 20, y);
  ctx.lineTo(x - 8, y);
  ctx.moveTo(x + 8, y);
  ctx.lineTo(x + 20, y);
  ctx.moveTo(x, y - 20);
  ctx.lineTo(x, y - 8);
  ctx.moveTo(x, y + 8);
  ctx.lineTo(x, y + 20);
  ctx.stroke();
  ctx.fillStyle = PALETTE.accent;
  ctx.beginPath();
  ctx.arc(x, y, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawFooter(ctx, game) {
  ctx.fillStyle = PALETTE.muted;
  ctx.font = '500 16px ' + FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(game.message, FIELD.width / 2, FOOTER_Y + 14);
  ctx.font = '500 13px ' + FONT;
  ctx.fillText('Click a difference — or move the crosshair with arrow keys and press Enter.  H hint · R restart · M sound', FIELD.width / 2, FOOTER_Y + 38);
}

function drawTitle(ctx, game) {
  ctx.fillStyle = PALETTE.overlay;
  ctx.fillRect(0, HEADER_H, FIELD.width, FIELD.height - HEADER_H);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '800 52px ' + FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('LANTERN LANE', FIELD.width / 2, 250);
  ctx.fillStyle = PALETTE.accent;
  ctx.font = '700 26px ' + FONT;
  ctx.fillText('Spot the Difference', FIELD.width / 2, 296);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '500 19px ' + FONT;
  ctx.fillText('Two pictures of one cosy evening street. Eight little things changed.', FIELD.width / 2, 348);
  ctx.fillText('Find them all — click with the mouse, or steer with the arrow keys.', FIELD.width / 2, 378);
  ctx.fillStyle = PALETTE.counterBg;
  roundRect(ctx, FIELD.width / 2 - 150, 420, 300, 52, 12);
  ctx.fill();
  ctx.fillStyle = PALETTE.counterText;
  ctx.font = '800 22px ' + FONT;
  ctx.fillText('Click or press Space to play', FIELD.width / 2, 447);
}

function drawWin(ctx, game) {
  ctx.fillStyle = PALETTE.overlay;
  ctx.fillRect(0, HEADER_H, FIELD.width, FIELD.height - HEADER_H);
  ctx.fillStyle = PALETTE.win;
  ctx.font = '800 48px ' + FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('You found them all!', FIELD.width / 2, 250);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '600 24px ' + FONT;
  ctx.fillText(`8 differences in ${formatTime(game.finishedMs)}  ·  ${game.misses} miss${game.misses === 1 ? '' : 'es'}`, FIELD.width / 2, 308);
  const accuracy = Math.round((8 / Math.max(8, 8 + game.misses)) * 100);
  ctx.font = '500 19px ' + FONT;
  ctx.fillText(`Accuracy ${accuracy}%   ·   Best time ${formatTime(game.bestMs)}`, FIELD.width / 2, 344);
  ctx.fillStyle = PALETTE.counterBg;
  roundRect(ctx, FIELD.width / 2 - 170, 390, 340, 52, 12);
  ctx.fill();
  ctx.fillStyle = PALETTE.counterText;
  ctx.font = '800 22px ' + FONT;
  ctx.fillText('Press R or click Restart to play again', FIELD.width / 2, 417);
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function resize() {
    const scale = Math.min(window.innerWidth / FIELD.width, window.innerHeight / FIELD.height);
    canvas.style.width = `${Math.floor(FIELD.width * scale)}px`;
    canvas.style.height = `${Math.floor(FIELD.height * scale)}px`;
  }

  return {
    resize,
    draw(game, now, hover) {
      ctx.fillStyle = PALETTE.backdrop;
      ctx.fillRect(0, 0, FIELD.width, FIELD.height);
      drawHeader(ctx, game, hover);
      drawPanel(ctx, game, 0);
      drawPanel(ctx, game, 1);
      if (game.screen !== SCREEN_TITLE) drawMarkers(ctx, game, now);
      drawCrosshair(ctx, game);
      if (game.screen === SCREEN_TITLE) drawTitle(ctx, game);
      if (game.screen === SCREEN_WIN) drawWin(ctx, game);
      drawFooter(ctx, game);
    },
  };
}
