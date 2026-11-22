// CURTAIN CALL — the three acts of the Grand Marlowe Theatre.
// Every act is plain data: walls, set-piece decor, loot, patrols, cameras,
// the exit, and where the thief slips in. Nothing here draws or moves.
window.CURTAIN_LEVELS = (function () {
  function border() {
    return [
      { x: 0, y: 56, w: 1280, h: 10, kind: 'wall' },
      { x: 0, y: 710, w: 1280, h: 10, kind: 'wall' },
      { x: 0, y: 56, w: 10, h: 664, kind: 'wall' },
      { x: 1270, y: 56, w: 10, h: 664, kind: 'wall' },
    ];
  }
  function seatRow(y) {
    return [
      { x: 120, y: y, w: 440, h: 72, kind: 'seats', solid: true },
      { x: 720, y: y, w: 440, h: 72, kind: 'seats', solid: true },
    ];
  }

  const ACTS = [
    {
      id: 1,
      name: 'ACT 1 — THE AUDITORIUM',
      hint: 'Cross behind their cones.',
      floor: 'carpet',
      quota: 2,
      playerStart: { x: 640, y: 678 },
      exit: { x: 1246, y: 600, w: 24, h: 96, label: 'BACKSTAGE' },
      walls: border(),
      decor: [
        ...seatRow(180), ...seatRow(320), ...seatRow(460),
        { x: 560, y: 120, w: 160, h: 26, kind: 'rope', solid: false },
        { x: 560, y: 600, w: 160, h: 26, kind: 'rope', solid: false },
        { x: 850, y: 100, w: 60, h: 60, kind: 'chandelier', solid: false },
        { x: 40, y: 84, w: 120, h: 40, kind: 'boxoffice', solid: true },
        { x: 1120, y: 84, w: 120, h: 40, kind: 'boxoffice', solid: true },
      ],
      loot: [
        { x: 84, y: 140, kind: 'cashbox', name: 'Box-office cashbox' },
        { x: 1196, y: 140, kind: 'jewel', name: 'Patron’s sapphire' },
      ],
      guards: [
        { kind: 'usher', waypoints: [[640, 140], [640, 660]], speed: 62 },
        { kind: 'usher', waypoints: [[72, 660], [72, 140]], speed: 55 },
        { kind: 'usher', waypoints: [[1208, 140], [1208, 660]], speed: 58 },
      ],
      cameras: [
        { x: 26, y: 76, base: 0.6, sweep: 0.9, period: 5.0 },
        { x: 1254, y: 76, base: 2.5, sweep: 0.9, period: 6.0 },
      ],
      followspot: null,
      footlights: null,
    },
    {
      id: 2,
      name: 'ACT 2 — BACKSTAGE',
      hint: 'Rails are cover. Lantern cones swing.',
      floor: 'wood',
      quota: 2,
      playerStart: { x: 640, y: 678 },
      exit: { x: 1246, y: 96, w: 24, h: 96, label: 'TO THE STAGE' },
      walls: border(),
      decor: [
        { x: 300, y: 150, w: 26, h: 220, kind: 'rail', solid: true },
        { x: 300, y: 430, w: 26, h: 220, kind: 'rail', solid: true },
        { x: 640, y: 150, w: 26, h: 220, kind: 'rail', solid: true },
        { x: 640, y: 430, w: 26, h: 220, kind: 'rail', solid: true },
        { x: 954, y: 150, w: 26, h: 220, kind: 'rail', solid: true },
        { x: 954, y: 430, w: 26, h: 220, kind: 'rail', solid: true },
        { x: 120, y: 580, w: 90, h: 70, kind: 'crate', solid: true },
        { x: 1070, y: 580, w: 90, h: 70, kind: 'crate', solid: true },
        { x: 460, y: 380, w: 70, h: 46, kind: 'trapdoor', solid: false },
        { x: 750, y: 380, w: 70, h: 46, kind: 'trapdoor', solid: false },
        { x: 150, y: 90, w: 110, h: 60, kind: 'piano', solid: true },
        { x: 1020, y: 90, w: 110, h: 60, kind: 'piano', solid: true },
      ],
      loot: [
        { x: 205, y: 130, kind: 'jewel', name: 'Prop-room ruby' },
        { x: 1075, y: 130, kind: 'jewel', name: 'Leading lady’s tiara' },
      ],
      guards: [
        { kind: 'stagehand', waypoints: [[140, 400], [1140, 400]], speed: 66 },
        { kind: 'stagehand', waypoints: [[480, 130], [480, 660]], speed: 60 },
      ],
      cameras: [
        { x: 26, y: 120, base: 0.4, sweep: 0.8, period: 5.5 },
        { x: 1254, y: 620, base: 2.7, sweep: 0.8, period: 4.5 },
      ],
      followspot: null,
      footlights: null,
    },
    {
      id: 3,
      name: 'ACT 3 — THE STAGE',
      hint: 'Time the followspot. Grab the Star.',
      floor: 'wood',
      quota: 1,
      playerStart: { x: 640, y: 678 },
      exit: { x: 1246, y: 320, w: 24, h: 110, label: 'STAGE DOOR' },
      walls: border(),
      decor: [
        { x: 10, y: 66, w: 84, h: 644, kind: 'curtain', solid: true },
        { x: 1186, y: 66, w: 84, h: 244, kind: 'curtain', solid: true },
        { x: 1186, y: 440, w: 84, h: 270, kind: 'curtain', solid: true },
        { x: 610, y: 280, w: 60, h: 60, kind: 'pedestal', solid: true },
        { x: 200, y: 656, w: 880, h: 18, kind: 'footlights', solid: false },
        { x: 150, y: 120, w: 70, h: 46, kind: 'crate', solid: true },
        { x: 1060, y: 120, w: 70, h: 46, kind: 'crate', solid: true },
        { x: 150, y: 520, w: 70, h: 46, kind: 'crate', solid: true },
        { x: 1060, y: 520, w: 70, h: 46, kind: 'crate', solid: true },
      ],
      loot: [
        { x: 640, y: 252, kind: 'diamond', name: 'The Star of the Stage' },
        { x: 185, y: 600, kind: 'jewel', name: 'Curtain-call emerald' },
        { x: 1095, y: 600, kind: 'jewel', name: 'Encore opal' },
      ],
      guards: [
        { kind: 'manager', waypoints: [[300, 220], [980, 220], [980, 520], [300, 520]], speed: 70 },
      ],
      cameras: [
        { x: 110, y: 76, base: 0.5, sweep: 0.7, period: 5.0 },
        { x: 1170, y: 76, base: 2.6, sweep: 0.7, period: 5.0 },
      ],
      followspot: { x: 640, y: 70, base: -1.5708, sweep: 1.05, period: 7.0 },
      footlights: { x: 200, y: 656, w: 880, h: 18 },
    },
  ];

  function solids(act) {
    const out = [];
    for (const w of act.walls) out.push(w);
    for (const d of act.decor) if (d.solid) out.push(d);
    return out;
  }

  return { ACTS, solids };
})();
