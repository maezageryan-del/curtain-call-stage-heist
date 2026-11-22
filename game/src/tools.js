// CURTAIN CALL — the thief's tools, each at a cost: a rose to lure a guard,
// stage smoke to vanish, and cutting the footlights to make shadow.
window.CURTAIN_TOOLS = (function () {
  const CFG = window.CURTAIN_CONFIG;

  function makeTools() {
    return {
      rose: CFG.tools.rose,
      smoke: CFG.tools.smoke,
      footlights: CFG.tools.footlights,
      roses: [], // {x, y, tx, ty, t}
      smokeTimer: 0,
      smokeX: 0, smokeY: 0,
      shadowZones: [], // {x, y, r, t}
    };
  }

  function nearestGuard(guards, x, y) {
    let best = null, bestD = 1e9;
    for (const g of guards) {
      const d = Math.hypot(g.x - x, g.y - y);
      if (d < bestD) { bestD = d; best = g; }
    }
    return best;
  }

  function tossRose(tools, guards, tx, ty, audio) {
    if (tools.rose <= 0) return false;
    tools.rose -= 1;
    tools.roses.push({ x: tx, y: ty, t: 0, landed: true });
    const g = nearestGuard(guards, tx, ty);
    if (g) window.CURTAIN_GUARDS.lureGuard(g, tx, ty);
    if (audio) audio.roseToss();
    return true;
  }

  function puffSmoke(tools, player, audio) {
    if (tools.smoke <= 0) return false;
    tools.smoke -= 1;
    tools.smokeTimer = CFG.smokeSeconds;
    tools.smokeX = player.x; tools.smokeY = player.y;
    player.hidden = true;
    if (audio) audio.smokePuff();
    return true;
  }

  function cutFootlights(tools, player, game, audio) {
    if (tools.footlights <= 0) return false;
    tools.footlights -= 1;
    tools.shadowZones.push({ x: player.x, y: player.y, r: 130, t: CFG.shadowSeconds });
    game.alarm = Math.min(100, game.alarm + CFG.footlightAlarmCost);
    if (audio) audio.footlightCut();
    return true;
  }

  function updateTools(tools, dt, player) {
    if (tools.smokeTimer > 0) {
      tools.smokeTimer -= dt;
      if (tools.smokeTimer <= 0) player.hidden = false;
    }
    for (const z of tools.shadowZones) z.t -= dt;
    tools.shadowZones = tools.shadowZones.filter((z) => z.t > 0);
    for (const r of tools.roses) r.t += dt;
    tools.roses = tools.roses.filter((r) => r.t < 6);
    // Standing in a cut-footlight shadow hides the thief from cones.
    let inShadow = false;
    for (const z of tools.shadowZones) {
      if (Math.hypot(player.x - z.x, player.y - z.y) < z.r) inShadow = true;
    }
    if (inShadow) player.hidden = true;
    else if (tools.smokeTimer <= 0) player.hidden = false;
  }

  return { makeTools, tossRose, puffSmoke, cutFootlights, updateTools };
})();
