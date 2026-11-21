// All sound is synthesised with WebAudio oscillators — no audio files, no
// network. The context is created on the first user gesture (browsers block
// audio before one); a staged screenshot never needs it.

let context = null;
let muted = false;

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function audio() {
  if (muted) return null;
  try {
    if (!context) context = new (window.AudioContext || window.webkitAudioContext)();
    if (context.state === 'suspended') void context.resume();
    return context;
  } catch {
    return null;
  }
}

function tone(ctx, frequency, startAt, duration, type, gain) {
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  amp.gain.setValueAtTime(0, startAt);
  amp.gain.linearRampToValueAtTime(gain, startAt + 0.015);
  amp.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.05);
}

/** Two-note chime when a difference is found. */
export function playFound() {
  const ctx = audio();
  if (!ctx) return;
  const now = ctx.currentTime;
  tone(ctx, 660, now, 0.18, 'sine', 0.16);
  tone(ctx, 990, now + 0.09, 0.28, 'sine', 0.16);
}

/** Low buzz for a wrong click. */
export function playMiss() {
  const ctx = audio();
  if (!ctx) return;
  tone(ctx, 140, ctx.currentTime, 0.16, 'square', 0.06);
}

/** Soft tick for a hint. */
export function playHint() {
  const ctx = audio();
  if (!ctx) return;
  tone(ctx, 880, ctx.currentTime, 0.12, 'triangle', 0.1);
}

/** Little rising fanfare on the win screen. */
export function playWin() {
  const ctx = audio();
  if (!ctx) return;
  const now = ctx.currentTime;
  [523, 659, 784, 1047].forEach((freq, index) => {
    tone(ctx, freq, now + index * 0.12, 0.3, 'triangle', 0.14);
  });
}
