// CURTAIN CALL — deterministic screenshot staging. Each shot sets up a real,
// reachable gameplay state through the game's own state (act, positions,
// suspicion, alarm, loot) and then freezes entity updates so the frame is
// stable; the render loop keeps drawing the live scene.
window.CURTAIN_SHOTS = (function () {
  const GAME = window.CURTAIN_GAME;

  function placeGuard(game, i, x, y, angle, suspicion) {
    const g = game.guards[i];
    if (!g) return;
    g.x = x; g.y = y; g.angle = angle; g.suspicion = suspicion;
    g.state = 'patrol'; g.pauseTimer = 99;
  }

  function applyShot(game, name) {
    game.shotFrozen = true;
    if (name === 'cover') {
      GAME.loadAct(game, 2);
      game.shotFrozen = true;
      game.player.x = 470; game.player.y = 560;
      game.player.sneaking = true;
      game.alarm = 35;
      game.tools.rose = 3; game.tools.smoke = 2; game.tools.footlights = 2;
      placeGuard(game, 0, 880, 300, Math.PI * 0.85, 42);
      if (game.cameras[0]) { game.cameras[0].angle = 0.9; game.cameras[0].suspicion = 18; }
      if (game.cameras[1]) { game.cameras[1].angle = 2.2; game.cameras[1].suspicion = 0; }
      if (game.followspot) { game.followspot.angle = -1.1; game.followspot.suspicion = 0; }
    } else if (name === 'auditorium') {
      GAME.loadAct(game, 0);
      game.shotFrozen = true;
      game.player.x = 640; game.player.y = 430;
      game.player.sneaking = true;
      game.alarm = 22;
      game.lootCount = 1;
      if (game.loot[0]) game.loot[0].taken = true;
      placeGuard(game, 0, 640, 300, Math.PI / 2, 30);
      placeGuard(game, 1, 72, 520, -Math.PI / 2, 0);
      placeGuard(game, 2, 1208, 240, Math.PI / 2, 12);
      if (game.cameras[0]) { game.cameras[0].angle = 1.1; game.cameras[0].suspicion = 0; }
      game.player.noiseRings.push({ x: 640, y: 430, r: 30, max: 52, alpha: 0.4 });
    } else if (name === 'nearmiss') {
      GAME.loadAct(game, 1);
      game.shotFrozen = true;
      game.player.x = 700; game.player.y = 400;
      game.player.sneaking = true;
      game.alarm = 68;
      game.lootCount = 1;
      if (game.loot[0]) game.loot[0].taken = true;
      placeGuard(game, 0, 560, 400, 0, 82);
      placeGuard(game, 1, 480, 560, -Math.PI / 2, 24);
      game.tools.roses.push({ x: 860, y: 400, t: 0.5, landed: true });
      if (game.cameras[0]) { game.cameras[0].angle = 0.8; game.cameras[0].suspicion = 30; }
      game.tools.shadowZones.push({ x: 700, y: 400, r: 110, t: 6 });
    } else if (name === 'getaway') {
      GAME.loadAct(game, 2);
      game.shotFrozen = true;
      game.player.x = 1195; game.player.y = 445;
      game.alarm = 84;
      game.lootCount = 3;
      game.hasDiamond = true;
      for (const item of game.loot) item.taken = true;
      placeGuard(game, 0, 900, 300, Math.PI, 88);
      if (game.cameras[0]) { game.cameras[0].angle = 1.2; game.cameras[0].suspicion = 64; }
      if (game.cameras[1]) { game.cameras[1].angle = 2.0; game.cameras[1].suspicion = 40; }
      if (game.followspot) { game.followspot.angle = -0.6; game.followspot.suspicion = 55; }
      game.spottedTimer = 0;
    }
    game.state = 'playing';
  }

  return { applyShot };
})();
