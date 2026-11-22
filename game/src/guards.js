// CURTAIN CALL — guards: patrol waypoints, raycast-blocked vision cones,
// suspicion that rises in a cone, decays when hidden, and a fair SPOTTED warning.
window.CURTAIN_GUARDS = (function () {
  const CFG = window.CURTAIN_CONFIG;

  function rectsOverlap(ax, ay, aw, ah, b) {
    return ax < b.x + b.w && ax + aw > b.x && ay < b.y + b.h && ay + ah > b.y;
  }
  function pointInRect(x, y, r) { return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; }

  // Line of sight: sample along the segment; blocked if a sample lands in a solid rect.
  function hasLineOfSight(x1, y1, x2, y2, solids) {
    const dx = x2 - x1, dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.ceil(dist / 6));
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const px = x1 + dx * t, py = y1 + dy * t;
      for (const r of solids) if (pointInRect(px, py, r)) return false;
    }
    return true;
  }

  function angleDiff(a, b) {
    let d = a - b;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  }

  function canSee(observer, px, py, solids, range, halfAngle) {
    const dx = px - observer.x, dy = py - observer.y;
    const dist = Math.hypot(dx, dy);
    if (dist > range) return false;
    const ang = Math.atan2(dy, dx);
    if (Math.abs(angleDiff(ang, observer.angle)) > halfAngle) return false;
    return hasLineOfSight(observer.x, observer.y, px, py, solids);
  }

  function makeGuard(def) {
    const wp = def.waypoints;
    return {
      kind: def.kind,
      waypoints: wp,
      wpIndex: 1,
      x: wp[0][0], y: wp[0][1],
      angle: Math.PI / 2,
      speed: def.speed || CFG.guardSpeed,
      suspicion: 0,
      state: 'patrol', // patrol | investigate | search
      investigateX: 0, investigateY: 0,
      investigateTimer: 0,
      lookTimer: 0,
      pauseTimer: 0,
    };
  }

  function moveWithCollision(g, dx, dy, solids) {
    const r = 13;
    let nx = g.x + dx;
    let blocked = false;
    for (const s of solids) if (rectsOverlap(nx - r, g.y - r, r * 2, r * 2, s)) { blocked = true; break; }
    if (!blocked) g.x = nx;
    let ny = g.y + dy;
    blocked = false;
    for (const s of solids) if (rectsOverlap(g.x - r, ny - r, r * 2, r * 2, s)) { blocked = true; break; }
    if (!blocked) g.y = ny;
  }

  function updateGuard(g, dt, player, solids, audio) {
    const seen = canSee(g, player.x, player.y, solids, CFG.visionRange, CFG.visionHalfAngle)
      && !player.hidden;
    if (g.state === 'investigate') {
      const dx = g.investigateX - g.x, dy = g.investigateY - g.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 8) {
        const sp = CFG.guardInvestigateSpeed * dt;
        g.angle = Math.atan2(dy, dx);
        moveWithCollision(g, (dx / dist) * sp, (dy / dist) * sp, solids);
      } else {
        g.investigateTimer -= dt;
        g.angle += dt * 1.6;
        if (g.investigateTimer <= 0) { g.state = 'patrol'; g.suspicion = Math.max(0, g.suspicion - 30); }
      }
    } else if (g.pauseTimer > 0) {
      g.pauseTimer -= dt;
      g.angle += dt * 0.9;
    } else {
      const target = g.waypoints[g.wpIndex];
      const dx = target[0] - g.x, dy = target[1] - g.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 10) {
        g.wpIndex = (g.wpIndex + 1) % g.waypoints.length;
        g.pauseTimer = 0.8;
      } else {
        const sp = g.speed * dt;
        g.angle = Math.atan2(dy, dx);
        moveWithCollision(g, (dx / dist) * sp, (dy / dist) * sp, solids);
      }
    }
    if (seen) {
      const rate = player.sneaking ? CFG.suspicionRiseSneak : CFG.suspicionRise;
      const before = g.suspicion;
      g.suspicion = Math.min(100, g.suspicion + rate * dt);
      if (before < 50 && g.suspicion >= 50 && audio) audio.suspicionSting();
    } else {
      g.suspicion = Math.max(0, g.suspicion - CFG.suspicionDecay * dt);
    }
    return seen;
  }

  function lureGuard(g, x, y) {
    g.state = 'investigate';
    g.investigateX = x; g.investigateY = y;
    g.investigateTimer = 3.5;
    g.suspicion = Math.max(g.suspicion, 35);
  }

  return { makeGuard, updateGuard, canSee, hasLineOfSight, angleDiff, lureGuard, moveWithCollision, rectsOverlap, pointInRect };
})();
