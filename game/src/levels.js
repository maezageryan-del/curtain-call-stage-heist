// The three acts of the Grand Marlowe Theatre. One job: the layout of each
// room — cover, loot, patrols, cameras, exits — as plain data.

export function buildLevel(act) {
  if (act === 0) return buildAuditorium();
  if (act === 1) return buildBackstage();
  return buildStage();
}

// Act 1 — The Auditorium. Seat rows with aisles, ushers with torches,
// a chandelier over the stalls, the box-office cashbox.
function buildAuditorium() {
  const covers = [];
  // Five rows of velvet seats, broken by three aisles (x 280-360, 600-680,
  // 920-1000) so the thief has several routes through the stalls.
  for (let r = 0; r < 5; r++) {
    const y = 200 + r * 80;
    for (const [x, w] of [[60, 220], [360, 240], [680, 240], [1000, 220]]) {
      covers.push({ x, y, w, h: 34, kind: 'seats' });
    }
  }
  covers.push({ x: 60, y: 84, w: 150, h: 56, kind: 'booth' }); // box office
  covers.push({ x: 1050, y: 120, w: 150, h: 56, kind: 'booth' }); // bar

  return {
    name: 'ACT 1 — THE AUDITORIUM',
    subtitle: 'Opening night. The house is full of eyes.',
    covers,
    decor: [
      { kind: 'chandelier', x: 640, y: 150 },
      { kind: 'curtain', x: 640, y: 66 },
      { kind: 'rope', x: 320, y: 620 },
      { kind: 'rope', x: 960, y: 620 },
    ],
    loot: [
      { id: 'cashbox', name: 'Box-office cashbox', x: 135, y: 112, taken: false, value: 1 },
      { id: 'jewels', name: 'A patron\u2019s jewels', x: 1120, y: 620, taken: false, value: 1 },
      { id: 'programme', name: 'Signed programmes', x: 700, y: 180, taken: false, value: 1 },
    ],
    quota: 1,
    quotaDiamond: false,
    guards: [
      { kind: 'usher', name: 'Usher', waypoints: [[640, 140], [640, 330]], speed: 55, range: 260, halfAngle: 0.5, color: '#d8b25a', light: '#ffb347' },
      { kind: 'usher', name: 'Usher', waypoints: [[180, 600], [1100, 600]], speed: 70, range: 250, halfAngle: 0.5, color: '#d8b25a', light: '#ffb347' },
    ],
    cameras: [
      { x: 44, y: 96, baseAngle: 0.5, sweep: 0.7, speed: 0.5, range: 300, halfAngle: 0.38 },
      { x: 1236, y: 96, baseAngle: Math.PI - 0.5, sweep: 0.7, speed: 0.45, range: 300, halfAngle: 0.38 },
    ],
    followspot: null,
    exit: { x: 1190, y: 62, w: 70, h: 26, label: 'BACKSTAGE' },
    spawn: { x: 640, y: 660 },
    hint: 'Seat rows are cover — break line of sight behind them. Grab loot, then slip out the backstage door.',
  };
}

// Act 2 — Backstage. Costume rails, stagehands with lanterns, trapdoors,
// props worth lifting.
function buildBackstage() {
  const covers = [
    { x: 300, y: 140, w: 26, h: 300, kind: 'rail' },
    { x: 640, y: 120, w: 26, h: 260, kind: 'rail' },
    { x: 980, y: 200, w: 26, h: 300, kind: 'rail' },
    { x: 150, y: 500, w: 90, h: 70, kind: 'crate' },
    { x: 1050, y: 480, w: 100, h: 80, kind: 'crate' },
    { x: 480, y: 520, w: 160, h: 70, kind: 'crate' },
    { x: 120, y: 180, w: 110, h: 60, kind: 'mirror' },
  ];
  return {
    name: 'ACT 2 — BACKSTAGE',
    subtitle: 'Costume rails, trapdoors, and men with lanterns.',
    covers,
    decor: [
      { kind: 'trapdoor', x: 640, y: 470 },
      { kind: 'trapdoor', x: 240, y: 330 },
      { kind: 'trapdoor', x: 1040, y: 330 },
      { kind: 'rail', x: 830, y: 140, w: 26, h: 120 },
    ],
    loot: [
      { id: 'crown', name: 'The prop crown', x: 1120, y: 150, taken: false, value: 1 },
      { id: 'silk', name: 'Silk costume', x: 200, y: 150, taken: false, value: 1 },
      { id: 'gold', name: 'Trapdoor gold', x: 640, y: 600, taken: false, value: 1 },
    ],
    quota: 1,
    quotaDiamond: false,
    guards: [
      { kind: 'stagehand', name: 'Stagehand', waypoints: [[400, 200], [400, 500]], speed: 60, range: 250, halfAngle: 0.5, color: '#c9a35a', light: '#ffc46b' },
      { kind: 'stagehand', name: 'Stagehand', waypoints: [[900, 500], [900, 220]], speed: 60, range: 250, halfAngle: 0.5, color: '#c9a35a', light: '#ffc46b' },
    ],
    cameras: [
      { x: 44, y: 360, baseAngle: 0, sweep: 0.8, speed: 0.55, range: 300, halfAngle: 0.38 },
      { x: 1236, y: 360, baseAngle: Math.PI, sweep: 0.8, speed: 0.5, range: 300, halfAngle: 0.38 },
    ],
    followspot: null,
    exit: { x: 1190, y: 62, w: 70, h: 26, label: 'THE STAGE' },
    spawn: { x: 640, y: 660 },
    hint: 'Costume rails hide you. The stagehands sweep their lanterns — move between sweeps.',
  };
}

// Act 3 — The Stage. The followspot sweeps the boards, the stage manager
// patrols, the diamond glows centre-stage, and the stage door waits.
function buildStage() {
  const covers = [
    { x: 30, y: 80, w: 56, h: 560, kind: 'curtainSide' },
    { x: 1194, y: 80, w: 56, h: 240, kind: 'curtainSide' },
    { x: 1194, y: 400, w: 56, h: 240, kind: 'curtainSide' },
    { x: 180, y: 180, w: 140, h: 92, kind: 'piano' },
    { x: 900, y: 160, w: 130, h: 62, kind: 'settee' },
    { x: 420, y: 560, w: 120, h: 60, kind: 'crate' },
    { x: 760, y: 560, w: 120, h: 60, kind: 'crate' },
  ];
  return {
    name: 'ACT 3 — THE STAGE',
    subtitle: 'The followspot is watching. The diamond is waiting.',
    covers,
    decor: [
      { kind: 'footlights', x: 0, y: 648 },
      { kind: 'spotlight', x: 640, y: 290 },
      { kind: 'curtain', x: 640, y: 66 },
    ],
    loot: [
      { id: 'diamond', name: 'The Star of the Stage', x: 640, y: 290, taken: false, value: 3, diamond: true },
      { id: 'goblet', name: 'Gold goblet', x: 300, y: 560, taken: false, value: 1 },
      { id: 'ruby', name: 'Ruby brooch', x: 980, y: 560, taken: false, value: 1 },
    ],
    quota: 1,
    quotaDiamond: true,
    guards: [
      { kind: 'manager', name: 'Stage Manager', waypoints: [[300, 600], [980, 600]], speed: 65, range: 270, halfAngle: 0.5, color: '#e8c96a', light: '#ffd27a' },
      { kind: 'usher', name: 'Usher', waypoints: [[200, 300], [200, 500]], speed: 55, range: 240, halfAngle: 0.5, color: '#d8b25a', light: '#ffb347' },
      { kind: 'usher', name: 'Usher', waypoints: [[1080, 300], [1080, 500]], speed: 55, range: 240, halfAngle: 0.5, color: '#d8b25a', light: '#ffb347' },
    ],
    cameras: [
      { x: 96, y: 300, baseAngle: 0.3, sweep: 0.6, speed: 0.6, range: 280, halfAngle: 0.38 },
      { x: 1184, y: 300, baseAngle: Math.PI - 0.3, sweep: 0.6, speed: 0.55, range: 280, halfAngle: 0.38 },
    ],
    followspot: { x: 640, y: 70, range: 540, halfAngle: 0.26, speed: 0.55, amp: 0.85 },
    exit: { x: 1224, y: 350, w: 32, h: 50, label: 'STAGE DOOR' },
    spawn: { x: 640, y: 660 },
    hint: 'Time the followspot. Grab the Star, then reach the stage door — and don\u2019t look back.',
  };
}
