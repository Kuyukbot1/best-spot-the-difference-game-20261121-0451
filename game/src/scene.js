// Lantern Lane: one cosy evening street, drawn twice — the left picture and
// the right picture. drawScene(ctx, ox, oy, variant, rng) paints the scene
// with its top-left corner at (ox, oy); variant 0 is the left picture,
// variant 1 the right one. The ONLY places the two variants differ are the
// eight planted differences in config.js; every other stroke is shared code
// fed by the same seeded generator, so the pictures match everywhere else.
//
// Panel-local coordinates, 600 wide x 576 tall:
//   sky 0..330, rooftops and houses 140..440, lane and cobbles 430..576.

import { DIFFERENCES, mulberry32 } from './config.js';

const SKY_TOP = '#232c52';
const SKY_MID = '#4a3a6d';
const SKY_LOW = '#c96a4e';
const ROOF = '#2e2140';
const HOUSE_A = '#41305a';
const HOUSE_B = '#382a4e';
const SHOP = '#54344a';
const LANE = '#5d4a63';
const COBBLE = '#6d5870';
const WOOD = '#6e4a35';
const MOON = '#f7ead0';
const STAR = '#ffeec2';

/** Look up whether a difference id is switched on in this variant. */
function changed(variant, id) {
  return variant === 1 && DIFFERENCES.some((d) => d.id === id);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function star(ctx, x, y, r) {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

function drawSky(ctx, rng) {
  const sky = ctx.createLinearGradient(0, 0, 0, 340);
  sky.addColorStop(0, SKY_TOP);
  sky.addColorStop(0.55, SKY_MID);
  sky.addColorStop(1, SKY_LOW);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 340);
  // Stars: fixed positions from the seeded generator, identical in both panels.
  ctx.fillStyle = STAR;
  for (let i = 0; i < 42; i += 1) {
    const x = 8 + rng() * 584;
    const y = 6 + rng() * 150;
    const r = 0.8 + rng() * 1.6;
    ctx.globalAlpha = 0.35 + rng() * 0.6;
    star(ctx, x, y, r);
  }
  ctx.globalAlpha = 1;
}

function drawMoon(ctx, variant) {
  ctx.fillStyle = MOON;
  ctx.beginPath();
  ctx.arc(500, 78, 32, 0, Math.PI * 2);
  ctx.fill();
  // The right picture shows a crescent: the dusk sky bites a disc out of it.
  if (changed(variant, 'moon')) {
    ctx.fillStyle = SKY_MID;
    ctx.beginPath();
    ctx.arc(516, 70, 28, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(247, 234, 208, 0.18)';
  ctx.beginPath();
  ctx.arc(500, 78, 44, 0, Math.PI * 2);
  ctx.fill();
}

function drawWireAndBird(ctx, variant) {
  ctx.strokeStyle = '#1d1428';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 34);
  ctx.quadraticCurveTo(300, 62, 600, 30);
  ctx.stroke();
  if (!changed(variant, 'bird')) {
    // A small bird dozing on the wire, above the right-hand house.
    ctx.fillStyle = '#241a33';
    ctx.beginPath();
    ctx.ellipse(430, 50, 13, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(441, 43, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(446, 43);
    ctx.lineTo(453, 45);
    ctx.lineTo(446, 47);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#241a33';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(426, 58);
    ctx.lineTo(426, 64);
    ctx.moveTo(434, 58);
    ctx.lineTo(434, 64);
    ctx.stroke();
  }
}

function drawStringLights(ctx, variant) {
  // A swag of warm lanterns across the lane, strung between the rooftops.
  ctx.strokeStyle = '#1d1428';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(30, 96);
  ctx.quadraticCurveTo(300, 150, 570, 92);
  ctx.stroke();
  const spots = [150, 300, 450];
  spots.forEach((x, index) => {
    if (index === 1 && changed(variant, 'lantern')) return; // middle lantern gone
    const y = 96 + Math.sin((x / 600) * Math.PI) * 26;
    ctx.strokeStyle = '#1d1428';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 12);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 179, 71, 0.25)';
    ctx.beginPath();
    ctx.arc(x, y + 26, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffb347';
    ctx.beginPath();
    ctx.ellipse(x, y + 26, 10, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7a4a12';
    ctx.fillRect(x - 4, y + 11, 8, 4);
  });
}

function drawHouse(ctx, x, y, w, h, colour, lit, variant) {
  ctx.fillStyle = colour;
  ctx.fillRect(x, y, w, h);
  // Roof.
  ctx.fillStyle = ROOF;
  ctx.beginPath();
  ctx.moveTo(x - 12, y);
  ctx.lineTo(x + w / 2, y - 52);
  ctx.lineTo(x + w + 12, y);
  ctx.closePath();
  ctx.fill();
  // Window: lit warm in the left picture, dark in the right one.
  const wx = x + w / 2 - 30;
  const wy = y + 42;
  ctx.fillStyle = lit ? '#ffd98a' : '#241a33';
  ctx.fillRect(wx, wy, 60, 70);
  ctx.strokeStyle = '#241a33';
  ctx.lineWidth = 3;
  ctx.strokeRect(wx, wy, 60, 70);
  ctx.beginPath();
  ctx.moveTo(wx + 30, wy);
  ctx.lineTo(wx + 30, wy + 70);
  ctx.moveTo(wx, wy + 35);
  ctx.lineTo(wx + 60, wy + 35);
  ctx.stroke();
  if (lit) {
    ctx.fillStyle = 'rgba(255, 217, 138, 0.16)';
    ctx.fillRect(wx - 14, wy - 10, 88, 92);
  }
  // Door.
  ctx.fillStyle = WOOD;
  ctx.fillRect(x + w / 2 - 22, y + h - 84, 44, 84);
  ctx.fillStyle = '#ffd98a';
  ctx.beginPath();
  ctx.arc(x + w / 2 + 14, y + h - 42, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawChimney(ctx, variant) {
  ctx.fillStyle = '#33254a';
  ctx.fillRect(516, 128, 30, 62);
  ctx.fillStyle = '#241a33';
  ctx.fillRect(512, 122, 38, 10);
  // Smoke curls above the chimney in both pictures.
  ctx.strokeStyle = 'rgba(232, 222, 240, 0.55)';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(531, 118);
  ctx.bezierCurveTo(520, 96, 544, 84, 532, 62);
  ctx.bezierCurveTo(524, 46, 540, 38, 534, 24);
  ctx.stroke();
  ctx.lineCap = 'butt';
}

function drawShop(ctx, variant) {
  // The little shopfront between the houses: "TEA & TALES".
  ctx.fillStyle = SHOP;
  ctx.fillRect(216, 296, 168, 150);
  ctx.fillStyle = '#2e1c33';
  ctx.fillRect(216, 296, 168, 10);
  // Sign board.
  ctx.fillStyle = '#f4ead8';
  roundRect(ctx, 232, 306, 136, 30, 6);
  ctx.fill();
  ctx.fillStyle = '#54344a';
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('TEA & TALES', 300, 322);
  // Awning: red stripes on the left, teal on the right.
  const stripe = changed(variant, 'awning') ? '#2fa8a0' : '#d94f4f';
  for (let i = 0; i < 6; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? stripe : '#f4ead8';
    const ax = 216 + i * 28;
    ctx.beginPath();
    ctx.moveTo(ax, 340);
    ctx.lineTo(ax + 28, 340);
    ctx.lineTo(ax + 24, 372);
    ctx.lineTo(ax + 4, 372);
    ctx.closePath();
    ctx.fill();
  }
  // Shop window with the cat on the sill.
  ctx.fillStyle = '#ffd98a';
  ctx.fillRect(252, 384, 96, 56);
  ctx.strokeStyle = '#241a33';
  ctx.lineWidth = 3;
  ctx.strokeRect(252, 384, 96, 56);
  ctx.beginPath();
  ctx.moveTo(300, 384);
  ctx.lineTo(300, 440);
  ctx.stroke();
  if (!changed(variant, 'cat')) {
    ctx.fillStyle = '#3a2a22';
    // Sitting cat, tail curled around its paws.
    ctx.beginPath();
    ctx.ellipse(300, 428, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(300, 408, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(291, 400);
    ctx.lineTo(294, 390);
    ctx.lineTo(298, 399);
    ctx.closePath();
    ctx.moveTo(309, 400);
    ctx.lineTo(306, 390);
    ctx.lineTo(302, 399);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#3a2a22';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(312, 430, 9, -0.4, 1.4);
    ctx.stroke();
  }
  // Shop door.
  ctx.fillStyle = WOOD;
  ctx.fillRect(356, 384, 20, 62);
}

function drawLane(ctx, rng) {
  ctx.fillStyle = LANE;
  ctx.fillRect(0, 430, 600, 146);
  ctx.fillStyle = COBBLE;
  for (let i = 0; i < 90; i += 1) {
    const x = 6 + rng() * 588;
    const y = 442 + rng() * 122;
    ctx.globalAlpha = 0.35 + rng() * 0.4;
    ctx.beginPath();
    ctx.ellipse(x, y, 12 + rng() * 10, 5 + rng() * 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // A puddle catching the lantern light.
  ctx.fillStyle = 'rgba(255, 179, 71, 0.28)';
  ctx.beginPath();
  ctx.ellipse(300, 540, 74, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(35, 44, 82, 0.5)';
  ctx.beginPath();
  ctx.ellipse(300, 542, 58, 10, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawBicycle(ctx, variant) {
  // A bicycle leaning by the right-hand house, front wheel to the right.
  const lean = -0.06;
  ctx.save();
  ctx.translate(430, 470);
  ctx.rotate(lean);
  ctx.strokeStyle = '#23202e';
  ctx.lineWidth = 5;
  // Wheels.
  ctx.beginPath();
  ctx.arc(-42, 22, 26, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(42, 22, 26, 0, Math.PI * 2);
  ctx.stroke();
  // Frame.
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-42, 22);
  ctx.lineTo(-8, -8);
  ctx.lineTo(42, 22);
  ctx.moveTo(-8, -8);
  ctx.lineTo(6, 22);
  ctx.moveTo(-8, -8);
  ctx.lineTo(-22, -18);
  ctx.moveTo(6, 22);
  ctx.lineTo(42, 22);
  ctx.stroke();
  // Handlebars and saddle.
  ctx.beginPath();
  ctx.moveTo(-22, -18);
  ctx.lineTo(-30, -26);
  ctx.moveTo(-22, -18);
  ctx.lineTo(-14, -24);
  ctx.moveTo(6, 22);
  ctx.lineTo(14, -2);
  ctx.moveTo(8, -4);
  ctx.lineTo(22, -4);
  ctx.stroke();
  if (!changed(variant, 'basket')) {
    // Wicker basket on the front, with a baguette poking out.
    ctx.fillStyle = '#8a6b4a';
    ctx.beginPath();
    ctx.moveTo(46, -6);
    ctx.lineTo(78, -6);
    ctx.lineTo(74, 18);
    ctx.lineTo(50, 18);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#6e4a35';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(48, 2);
    ctx.lineTo(76, 2);
    ctx.moveTo(49, 10);
    ctx.lineTo(75, 10);
    ctx.stroke();
    ctx.fillStyle = '#d9a75f';
    ctx.beginPath();
    ctx.ellipse(64, -12, 6, 14, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawPlants(ctx, variant) {
  // Two pots by the lane: the left one is plain, the right one is the tell.
  drawPot(ctx, 52, 528, '#e5534b');
  drawPot(ctx, 566, 528, changed(variant, 'flowers') ? '#9b59d0' : '#e5534b');
}

function drawPot(ctx, x, y, bloom) {
  ctx.fillStyle = '#4f8f5a';
  ctx.beginPath();
  ctx.ellipse(x, y - 26, 26, 12, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = bloom;
  [[-14, -34], [0, -42], [14, -34], [-7, -30], [7, -30]].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(x + dx, y + dy, 7, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = '#b4632e';
  ctx.beginPath();
  ctx.moveTo(x - 22, y - 18);
  ctx.lineTo(x + 22, y - 18);
  ctx.lineTo(x + 16, y + 14);
  ctx.lineTo(x - 16, y + 14);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#8a4a22';
  ctx.fillRect(x - 24, y - 22, 48, 7);
}

function drawLampPost(ctx) {
  ctx.fillStyle = '#241a33';
  ctx.fillRect(196, 380, 8, 96);
  ctx.beginPath();
  ctx.moveTo(200, 380);
  ctx.quadraticCurveTo(200, 360, 218, 360);
  ctx.strokeStyle = '#241a33';
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 179, 71, 0.3)';
  ctx.beginPath();
  ctx.arc(222, 372, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffb347';
  ctx.beginPath();
  ctx.ellipse(222, 372, 9, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7a4a12';
  ctx.fillRect(216, 358, 12, 5);
}

/** Paint the whole scene for one panel. variant 0 = left picture, 1 = right. */
export function drawScene(ctx, ox, oy, variant, seed) {
  const rng = mulberry32(seed);
  ctx.save();
  ctx.translate(ox, oy);
  ctx.beginPath();
  ctx.rect(0, 0, 600, 576);
  ctx.clip();
  drawSky(ctx, rng);
  drawMoon(ctx, variant);
  drawWireAndBird(ctx, variant);
  drawStringLights(ctx, variant);
  drawHouse(ctx, 28, 250, 150, 190, HOUSE_A, true, variant);
  drawHouse(ctx, 396, 220, 176, 220, HOUSE_B, !changed(variant, 'window'), variant);
  drawChimney(ctx, variant);
  drawShop(ctx, variant);
  drawLane(ctx, rng);
  drawLampPost(ctx);
  drawBicycle(ctx, variant);
  drawPlants(ctx, variant);
  ctx.restore();
}
