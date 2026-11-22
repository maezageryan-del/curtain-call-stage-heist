// CURTAIN CALL — boot: canvas, game loop, first screen is gameplay.
(function () {
  const CFG = window.CURTAIN_CONFIG;
  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d');
  const game = window.CURTAIN_GAME.makeGame();
  window.CURTAIN_GAME_INSTANCE = game;

  window.CURTAIN_INPUT.attach(canvas);

  // Deterministic screenshot staging: ?shot=cover|auditorium|nearmiss|getaway
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (shot) window.CURTAIN_SHOTS.applyShot(game, shot);

  function exposeState() {
    window.__gameState = window.CURTAIN_GAME.gameState(game);
  }

  let last = performance.now();
  function frame(now) {
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.05) dt = 0.05;
    if (dt < 0) dt = 0;
    window.CURTAIN_GAME.update(game, dt);
    // Keep the followspot and cameras sweeping even in a frozen shot frame.
    if (game.shotFrozen) {
      game.time += dt;
      if (game.followspot) game.followspot.angle = window.CURTAIN_CAMERAS.sweepAngle(game.followspot, game.time);
      for (const cam of game.cameras) cam.angle = window.CURTAIN_CAMERAS.sweepAngle(cam, game.time);
    }
    window.CURTAIN_RENDER.render(ctx, game, game.time);
    exposeState();
    requestAnimationFrame(frame);
  }

  exposeState();
  requestAnimationFrame(frame);
})();
