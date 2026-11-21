// Boot and the one loop: input is read every frame, the clock advances, and
// the renderer paints what is there. The game moves between three screens:
// title, play and win.
//
// ?seed=N fixes the stars and cobbles. ?shot=start|play|almost|win (with
// &seed=N) stages that scene instead of running the loop, paints it twice and
// sets window.__shotReady for a screenshot.

import { FIELD, formatTime } from './config.js';
import {
  ACTION_CONFIRM,
  ACTION_HINT,
  ACTION_MUTE,
  ACTION_RESTART,
  createInput,
} from './input.js';
import {
  SCREEN_PLAY,
  SCREEN_TITLE,
  SCREEN_WIN,
  buttonAt,
  clickAt,
  createGame,
  isWon,
  startRound,
  tick,
  useHint,
} from './game.js';
import { createRenderer } from './render.js';
import { playFound, playHint, playMiss, playWin, setMuted } from './sound.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
canvas.width = FIELD.width;
canvas.height = FIELD.height;
const status = document.getElementById('status');
const game = createGame(seed);
const renderer = createRenderer(canvas);
renderer.resize();
window.addEventListener('resize', renderer.resize);

function announce(message) {
  status.textContent = message;
}

function runShot(name) {
  const now = performance.now();
  stageShot(name, game, now);
  let painted = 0;
  function paint() {
    renderer.draw(game, performance.now(), null);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas, game);

  function handleClick(point) {
    const now = performance.now();
    const button = buttonAt(point.x, point.y);
    if (button === 'hint') {
      if (useHint(game, now)) {
        playHint();
        announce(game.message);
      }
      return;
    }
    if (button === 'sound') {
      game.muted = !game.muted;
      setMuted(game.muted);
      announce(game.muted ? 'Sound off.' : 'Sound on.');
      return;
    }
    if (button === 'restart') {
      startRound(game, now);
      announce('New round. Find 8 differences.');
      return;
    }
    if (game.screen === SCREEN_TITLE) {
      startRound(game, now);
      announce('Playing. Find 8 differences.');
      return;
    }
    if (game.screen === SCREEN_WIN) return;
    const result = clickAt(game, point.x, point.y, now);
    if (result === 'found') {
      playFound();
      announce(game.message);
      if (isWon(game)) playWin();
    } else if (result === 'miss') {
      playMiss();
      announce(game.message);
    }
  }

  function handleActions() {
    const actions = input.takeActions();
    const now = performance.now();
    if (actions & ACTION_CONFIRM) {
      if (game.screen === SCREEN_TITLE) {
        startRound(game, now);
        announce('Playing. Find 8 differences.');
      } else if (game.screen === SCREEN_PLAY) {
        handleClick(game.crosshair);
      } else if (game.screen === SCREEN_WIN) {
        startRound(game, now);
        announce('New round. Find 8 differences.');
      }
    }
    if (actions & ACTION_HINT) {
      if (useHint(game, now)) {
        playHint();
        announce(game.message);
      }
    }
    if (actions & ACTION_RESTART) {
      startRound(game, now);
      announce('New round. Find 8 differences.');
    }
    if (actions & ACTION_MUTE) {
      game.muted = !game.muted;
      setMuted(game.muted);
      announce(game.muted ? 'Sound off.' : 'Sound on.');
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    tick(game, now);
    handleActions();
    for (const point of input.takeClicks()) handleClick(point);
    renderer.draw(game, now, input.hover());
  }

  announce('Lantern Lane, spot the difference. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
