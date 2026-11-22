// Boot + main loop for CURTAIN CALL. One job: start the game, run the
// frame loop, and expose the hooks headless checks use.

import { W, H } from './config.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { Game } from './game.js';
import { render } from './render.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

function fitCanvas() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
fitCanvas();
window.addEventListener('resize', fitCanvas);

const input = createInput(canvas);
const audio = createAudio();
const game = new Game(input, audio);

// Headless hooks: the live game object and its loader, for verification.
window.CURTAIN_GAME_INSTANCE = game;
window.CURTAIN_GAME = {
  loadAct(g, act) { g.loadAct(act); },
  restart(g) { g.restart(); },
};

// Screenshot staging: ?shot=cover|auditorium|nearmiss|getaway
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  applyShot(game, shot);
}

function syncState() {
  window.__gameState = game.snapshot();
  if (statusEl) {
    const s = window.__gameState;
    statusEl.textContent = `${s.actName}: ${s.state}, loot ${s.loot}/${s.lootQuota}, alarm ${s.alarm}%`;
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  // Resume from pause lives here so P works even while paused (the game
  // update returns early in the paused state).
  if (game.state === 'paused' && input.tapped('KeyP')) game.resume();
  if (game.state === 'paused' && input.tapped('KeyR')) game.restart();
  if ((game.state === 'caught' || game.state === 'won') && input.tapped('KeyR')) game.restart();
  audio.unlock();
  game.update(dt);
  render(ctx, game, now / 1000);
  syncState();
  input.endFrame();
  requestAnimationFrame(frame);
}

syncState();
requestAnimationFrame(frame);
