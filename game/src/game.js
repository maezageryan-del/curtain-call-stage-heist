// CURTAIN CALL — the game itself: state machine, alarm, suspicion,
// the fair SPOTTED warning, act changes, and the stage-door getaway.
window.CURTAIN_GAME = (function () {
  const CFG = window.CURTAIN_CONFIG;
  const LEVELS = window.CURTAIN_LEVELS;
  const GUARDS = window.CURTAIN_GUARDS;
  const CAMERAS = window.CURTAIN_CAMERAS;
  const PLAYER = window.CURTAIN_PLAYER;
  const TOOLS = window.CURTAIN_TOOLS;
  const AUDIO = window.CURTAIN_AUDIO;
  const INPUT = window.CURTAIN_INPUT;

  function makeGame() {
    const game = {
      state: 'playing', // playing | paused | caught | won | actclear
      actIndex: 0,
      act: LEVELS.ACTS[0],
      time: 0,
      alarm: 0,
      lootCount: 0,
      hasDiamond: false,
      spottedTimer: 0,
      spottedBy: null,
      actClearText: '',
      actClearTimer: 0,
      guards: [],
      cameras: [],
      followspot: null,
      loot: [],
      player: null,
      tools: null,
      solids: [],
      shotFrozen: false,
      message: '',
    };
    loadAct(game, 0);
    return game;
  }

  function loadAct(game, index) {
    game.actIndex = index;
    game.act = LEVELS.ACTS[index];
    game.solids = LEVELS.solids(game.act);
    game.guards = game.act.guards.map((d) => GUARDS.makeGuard(d));
    game.cameras = game.act.cameras.map((d) => CAMERAS.makeCamera(d));
    game.followspot = CAMERAS.makeFollowspot(game.act.followspot);
    game.loot = game.act.loot.map((l) => ({ x: l.x, y: l.y, kind: l.kind, name: l.name, taken: false }));
    game.player = PLAYER.makePlayer(game.act.playerStart);
    game.lootCount = 0;
    game.spottedTimer = 0;
    game.spottedBy = null;
    if (index === 0) {
      game.tools = TOOLS.makeTools();
      game.alarm = 0;
      game.hasDiamond = false;
    } else {
      game.alarm = Math.max(0, game.alarm - 40);
    }
  }

  function maxSuspicion(game) {
    let m = 0;
    for (const g of game.guards) m = Math.max(m, g.suspicion);
    for (const c of game.cameras) m = Math.max(m, c.suspicion);
    if (game.followspot) m = Math.max(m, game.followspot.suspicion);
    return m;
  }

  function keyEdge(game, code) {
    if (INPUT.keys[code] && !game._prevKeys[code]) { game._prevKeys[code] = true; return true; }
    if (!INPUT.keys[code]) game._prevKeys[code] = false;
    return false;
  }

  function update(game, dt) {
    if (!game._prevKeys) game._prevKeys = {};
    // Global keys work in every state.
    if (keyEdge(game, 'm')) AUDIO.toggleMute();
    if (keyEdge(game, 'r')) { loadAct(game, game.state === 'won' ? 0 : game.actIndex); game.state = 'playing'; return; }
    if (game.state === 'paused') {
      if (keyEdge(game, 'p') || keyEdge(game, 'escape')) game.state = 'playing';
      return;
    }
    if (game.state === 'caught' || game.state === 'won') return;
    if (game.state === 'actclear') {
      game.actClearTimer -= dt;
      if (game.actClearTimer <= 0) {
        loadAct(game, game.actIndex + 1);
        game.state = 'playing';
      }
      return;
    }
    if (keyEdge(game, 'p') || keyEdge(game, 'escape')) { game.state = 'paused'; return; }

    game.time += dt;
    AUDIO.stageBell(dt);
    if (game.shotFrozen) return;

    PLAYER.updatePlayer(game.player, dt, game.solids, AUDIO);
    TOOLS.updateTools(game.tools, dt, game.player);

    // Tools on number keys (edge-triggered).
    if (keyEdge(game, '1')) TOOLS.tossRose(game.tools, game.guards, INPUT.mouse.x, INPUT.mouse.y, AUDIO);
    if (keyEdge(game, '2')) TOOLS.puffSmoke(game.tools, game.player, AUDIO);
    if (keyEdge(game, '3')) TOOLS.cutFootlights(game.tools, game.player, game, AUDIO);

    // Grab loot with E.
    if (keyEdge(game, 'e')) {
      const item = PLAYER.lootInReach(game.player, game.loot);
      if (item) {
        item.taken = true;
        game.lootCount += 1;
        if (item.kind === 'diamond') game.hasDiamond = true;
        AUDIO.pickup();
        game.message = 'Stole: ' + item.name;
      }
    }

    // Detection: guards, cameras, followspot.
    let anyoneSees = false;
    for (const g of game.guards) if (GUARDS.updateGuard(g, dt, game.player, game.solids, AUDIO)) anyoneSees = true;
    for (const c of game.cameras) if (CAMERAS.updateWatcher(c, dt, game.time, game.player, game.solids, CFG.cameraRange, CFG.cameraHalfAngle, AUDIO)) anyoneSees = true;
    if (game.followspot) {
      if (CAMERAS.updateWatcher(game.followspot, dt, game.time, game.player, game.solids, CFG.followspotRange, CFG.followspotHalfAngle, AUDIO)) anyoneSees = true;
    }

    // Alarm follows the hottest suspicion, and cools when nobody sees us.
    const hot = maxSuspicion(game);
    if (anyoneSees) game.alarm = Math.min(100, Math.max(game.alarm, hot));
    else game.alarm = Math.max(0, game.alarm - CFG.alarmDecay * dt);

    // Fair caught moment: 2 seconds of SPOTTED warning to break line of sight.
    if (hot >= 100 && game.spottedTimer <= 0 && game.state === 'playing') {
      game.spottedTimer = CFG.spottedSeconds;
      AUDIO.alarmBlare();
    }
    if (game.spottedTimer > 0) {
      if (!anyoneSees) { game.spottedTimer = 0; for (const g of game.guards) g.suspicion = Math.min(g.suspicion, 60); for (const c of game.cameras) c.suspicion = Math.min(c.suspicion, 60); if (game.followspot) game.followspot.suspicion = Math.min(game.followspot.suspicion, 60); }
      else {
        game.spottedTimer -= dt;
        if (game.spottedTimer <= 0) {
          game.state = 'caught';
          AUDIO.caughtSting();
          return;
        }
      }
    }

    // Exit: needs the act's loot quota; the diamond then the stage door wins the game.
    if (PLAYER.atExit(game.player, game.act.exit) && game.lootCount >= game.act.quota) {
      if (game.actIndex === LEVELS.ACTS.length - 1) {
        game.state = 'won';
        AUDIO.applause();
      } else {
        game.state = 'actclear';
        game.actClearTimer = 2.2;
        game.actClearText = game.actIndex === 0 ? 'ACT 1 CLEAR — INTO THE WINGS…' : 'ACT 2 CLEAR — ONTO THE STAGE…';
        AUDIO.actClear();
      }
    }
  }

  function gameState(game) {
    return {
      state: game.state,
      act: game.actIndex + 1,
      actName: game.act.name,
      loot: game.lootCount,
      lootQuota: game.act.quota,
      hasDiamond: game.hasDiamond,
      alarm: Math.round(game.alarm),
      suspicion: Math.round(maxSuspicion(game)),
      spottedTimer: Math.round(game.spottedTimer * 100) / 100,
      tools: { rose: game.tools.rose, smoke: game.tools.smoke, footlights: game.tools.footlights },
      player: { x: Math.round(game.player.x), y: Math.round(game.player.y) },
      muted: AUDIO.isMuted(),
    };
  }

  return { makeGame, loadAct, update, gameState, maxSuspicion };
})();
