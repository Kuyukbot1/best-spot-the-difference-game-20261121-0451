[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Kuyukbot1/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Kuyukbot1/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

# Lantern Lane — Spot the Difference

Bounty: [best-spot-the-difference-game-20261121-0451 — "Make the best spot the difference game"](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

Two pictures of one cosy evening street, drawn entirely in code. Eight
little things changed between them — find them all. Click with the mouse, or
steer the crosshair with the arrow keys and press Enter. Hints, a timer, a
best time, and WebAudio chimes (synthesised, no audio files). No network
request, no library, no build step: `game/index.html` opens in desktop
Chrome and plays from static files.

## The 8 differences

1. **The moon** — full in Picture A, crescent in Picture B
2. **The bird on the wire** — perched in A, gone in B
3. **The middle lantern** — three lanterns strung across the lane in A, two in B
4. **The upstairs window** — lit warm in A, dark in B
5. **The shop awning** — red stripes in A, teal in B
6. **The cat in the window** — sitting in the tea-shop window in A, gone in B
7. **The bicycle basket** — fitted in A, gone in B
8. **The potted flowers** — red blooms in A, purple in B

## How it plays

- **Find a difference:** click it on either picture. A green ring and tick
  appear on both pictures at once, the counter drops, and a chime plays.
- **Wrong spot:** a red X flashes and the miss count rises — accuracy is
  shown on the win screen.
- **Hint (H):** rings one unfound difference for a few seconds. Three per round.
- **Timer:** counts up while you play; your fastest win is kept in the browser.
- **Win:** find all 8 and the win card shows your time, misses and accuracy.
- **Restart (R)** starts a fresh round; **M** toggles sound.

## Files

- `main.ts` — the hand-in program (Node 22, stdlib only): copies `game/` and
  `screenshots/` to `/output` and writes `/output/dossier.json`.
- `game/index.html` + `game/src/*.js` — the game: `config.js` (all tuning and
  the 8 differences), `scene.js` (all art, drawn in code), `game.js` (rules),
  `render.js` (canvas renderer), `input.js` (mouse + keyboard), `sound.js`
  (synthesised chimes), `shots.js` (deterministic screenshot scenes),
  `main.js` (boot and loop).
- `screenshots/` — 4 real renders of the game's own code in headless Chrome:
  title, 3 found / 5 left, 6 found / 2 left, and the win screen.
- `vendor/makefun-game.ts` — the kit's copy, unchanged.
- `serve.ts` — tiny static server for local play (`node serve.ts`).

## Play it

```sh
node serve.ts            # serves game/ on http://localhost:8080
```

Or hand it in outside the grader with:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Licence

MIT — see `LICENSE`.
