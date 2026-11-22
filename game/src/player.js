// CURTAIN CALL — the thief: movement, sneak, click-to-walk, noise rings,
// grabbing loot, and the stage-door exit.
window.CURTAIN_PLAYER = (function () {
  const CFG = window.CURTAIN_CONFIG;
  const G = window.CURTAIN_GUARDS;
  const INPUT = window.CURTAIN_INPUT;

  function makePlayer(start) {
    return {
      x: start.x, y: start.y, r: 14,
      sneaking: false, hidden: false,
      walkTarget: null,
      noiseTimer: 0,
      noiseRings: [],
      stepTimer: 0,
      facing: -Math.PI / 2,
    };
  }

  function moveWithCollision(p, dx, dy, solids) {
    const r = p.r;
    let nx = p.x + dx;
    let blocked = false;
    for (const s of solids) if (G.rectsOverlap(nx - r, p.y - r, r * 2, r * 2, s)) { blocked = true; break; }
    if (!blocked) p.x = nx;
    let ny = p.y + dy;
    blocked = false;
    for (const s of solids) if (G.rectsOverlap(p.x - r, ny - r, r * 2, r * 2, s)) { blocked = true; break; }
    if (!blocked) p.y = ny;
  }

  function updatePlayer(p, dt, solids, audio) {
    p.sneaking = !!INPUT.keys['shift'];
    const mv = INPUT.moveVector();
    let mx = mv.x, my = mv.y;
    if (mx === 0 && my === 0 && p.walkTarget) {
      const dx = p.walkTarget.x - p.x, dy = p.walkTarget.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 10) { p.walkTarget = null; }
      else { mx = dx / dist; my = dy / dist; }
    }
    const speed = (p.sneaking ? CFG.sneakSpeed : CFG.walkSpeed) * dt;
    if (mx !== 0 || my !== 0) {
      p.facing = Math.atan2(my, mx);
      moveWithCollision(p, mx * speed, my * speed, solids);
      p.stepTimer -= dt;
      if (p.stepTimer <= 0) {
        p.stepTimer = p.sneaking ? 0.55 : 0.34;
        if (audio) audio.footstep(p.sneaking);
        p.noiseRings.push({ x: p.x, y: p.y, r: 6, max: p.sneaking ? 26 : 52, alpha: 0.5 });
      }
    }
    if (INPUT.consumeClick()) {
      p.walkTarget = { x: INPUT.mouse.clickX, y: INPUT.mouse.clickY };
    }
    for (const ring of p.noiseRings) { ring.r += dt * 55; ring.alpha -= dt * 0.55; }
    p.noiseRings = p.noiseRings.filter((ring) => ring.alpha > 0 && ring.r < ring.max);
  }

  // Nearest loot within reach; returns it or null.
  function lootInReach(p, loot) {
    let best = null, bestD = 46;
    for (const item of loot) {
      if (item.taken) continue;
      const d = Math.hypot(item.x - p.x, item.y - p.y);
      if (d < bestD) { bestD = d; best = item; }
    }
    return best;
  }

  function atExit(p, exit) {
    return p.x > exit.x - 6 && p.x < exit.x + exit.w + 6 && p.y > exit.y && p.y < exit.y + exit.h;
  }

  return { makePlayer, updatePlayer, moveWithCollision, lootInReach, atExit };
})();
