// Deterministic screenshot staging. One job: put the real game into the
// exact state each screenshot shows, then freeze it so the frame is stable.
//
//   ?shot=cover      — the stage mid-sweep, all five required elements
//   ?shot=auditorium — the thief between the seat rows
//   ?shot=nearmiss   — a cone about to cross the thief, rose in flight
//   ?shot=getaway    — the stage door with the diamond, alarm high

export function applyShot(game, name) {
  const g = game;
  if (name === 'cover') {
    g.loadAct(2);
    g.player.x = 560;
    g.player.y = 520;
    g.player.dirX = 0;
    g.player.dirY = -1;
    // Followspot mid-sweep across the stage.
    g.followspot.t = 1.1;
    g.followspot.angle = Math.PI / 2 + 0.55;
    // Two ushers' cones crossing the boards, stage manager below.
    g.guards[1].x = 200;
    g.guards[1].y = 380;
    g.guards[1].angle = 0.35;
    g.guards[1].pauseTimer = 99;
    g.guards[2].x = 1080;
    g.guards[2].y = 380;
    g.guards[2].angle = Math.PI - 0.35;
    g.guards[2].pauseTimer = 99;
    g.guards[0].x = 640;
    g.guards[0].y = 600;
    g.guards[0].angle = -Math.PI / 2;
    g.guards[0].pauseTimer = 99;
    g.cameras[0].angle = 0.6;
    g.cameras[1].angle = Math.PI - 0.6;
    g.alarm = 35;
    g.alarmPeak = 35;
    g.suspicion = 20;
    g.lootCount = 2;
    g.tools.rose = 2;
    g.tools.smoke = 1;
    g.tools.lights = 1;
    g.tools.shadowZones.push({ x: 480, y: 470, w: 220, h: 110, life: 999 });
    g.player.hidden = true;
  } else if (name === 'auditorium') {
    g.loadAct(0);
    g.player.x = 640;
    g.player.y = 470;
    g.player.dirX = 0;
    g.player.dirY = -1;
    g.guards[0].x = 640;
    g.guards[0].y = 250;
    g.guards[0].angle = Math.PI / 2;
    g.guards[0].pauseTimer = 99;
    g.guards[1].x = 420;
    g.guards[1].y = 600;
    g.guards[1].angle = 0;
    g.guards[1].pauseTimer = 99;
    g.cameras[0].angle = 0.9;
    g.alarm = 12;
    g.suspicion = 34;
    g.lootCount = 1;
  } else if (name === 'nearmiss') {
    g.loadAct(1);
    g.player.x = 330;
    g.player.y = 300;
    g.player.dirX = 1;
    g.player.dirY = 0;
    // A stagehand's lantern cone about to cross the thief, who is tucked
    // behind the costume rail.
    g.guards[0].x = 400;
    g.guards[0].y = 180;
    g.guards[0].angle = Math.PI / 2;
    g.guards[0].pauseTimer = 99;
    g.guards[1].x = 900;
    g.guards[1].y = 420;
    g.guards[1].angle = -Math.PI / 2;
    g.guards[1].pauseTimer = 99;
    g.cameras[0].angle = -0.4;
    g.alarm = 48;
    g.suspicion = 82;
    g.lootCount = 1;
    g.tools.rose = 2;
    // A rose in flight toward the far rail.
    g.tools.roses.push({ x: 330, y: 300, tx: 700, ty: 260, t: 0.2, dur: 0.45 });
  } else if (name === 'getaway') {
    g.loadAct(2);
    // Diamond in hand, thief at the stage door, alarm high.
    const diamond = g.level.loot.find((l) => l.diamond);
    if (diamond) diamond.taken = true;
    g.diamond = true;
    g.lootCount = 3;
    g.refreshExit();
    g.player.x = 1200;
    g.player.y = 375;
    g.player.dirX = 1;
    g.player.dirY = 0;
    g.followspot.t = 2.4;
    g.followspot.angle = Math.PI / 2 - 0.6;
    g.guards[0].x = 500;
    g.guards[0].y = 600;
    g.guards[0].angle = 0;
    g.guards[0].pauseTimer = 99;
    g.guards[1].x = 200;
    g.guards[1].y = 420;
    g.guards[1].angle = 0.5;
    g.guards[1].pauseTimer = 99;
    g.guards[2].x = 1080;
    g.guards[2].y = 420;
    g.guards[2].angle = Math.PI - 0.5;
    g.guards[2].pauseTimer = 99;
    g.alarm = 78;
    g.alarmPeak = 78;
    g.suspicion = 55;
    g.tools.rose = 1;
    g.tools.smoke = 0;
    g.tools.lights = 0;
  } else {
    return false;
  }
  g.frozen = true;
  return true;
}
