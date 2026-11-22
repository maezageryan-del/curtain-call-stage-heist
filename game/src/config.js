// Shared constants, palette and geometry helpers for CURTAIN CALL.
// One job: the numbers and colours every other module agrees on.

export const W = 1280;
export const H = 720;
export const HUD_H = 56;

// Palette: deep burgundy velvet, gold, dark auditorium blue-black.
export const PAL = {
  floor: '#1a1024',
  floorAlt: '#221430',
  velvet: '#5e0f24',
  velvetDark: '#3d0a18',
  velvetBright: '#8a1832',
  gold: '#f2c14e',
  goldDim: '#a8842e',
  cream: '#f5e6c8',
  ink: '#0a0610',
  wood: '#6b4226',
  woodLight: '#8a5a34',
  stage: '#7a4a28',
  stageLight: '#9a6538',
  curtain: '#7d1226',
  curtainDark: '#560a1a',
  cone: 'rgba(255, 190, 80, 0.28)',
  coneEdge: 'rgba(255, 210, 120, 0.55)',
  spot: 'rgba(255, 244, 200, 0.30)',
  danger: '#ff4d4d',
  alarm: '#e53238',
  shadow: 'rgba(8, 4, 16, 0.72)',
  smoke: 'rgba(200, 200, 210, 0.35)',
  seat: '#4a0e20',
  seatTop: '#6b1430',
};

export const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);

// Smallest signed angle from a to b, in (-PI, PI].
export function angleDiff(a, b) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d <= -Math.PI) d += Math.PI * 2;
  return d;
}

// Does segment (x1,y1)-(x2,y2) cross rectangle r {x,y,w,h}?
export function segHitsRect(x1, y1, x2, y2, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let tmin = 0;
  let tmax = 1;
  const slabs = [
    [x1, dx, r.x, r.x + r.w],
    [y1, dy, r.y, r.y + r.h],
  ];
  for (const [o, d, lo, hi] of slabs) {
    if (Math.abs(d) < 1e-9) {
      if (o < lo || o > hi) return false;
    } else {
      let t1 = (lo - o) / d;
      let t2 = (hi - o) / d;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return false;
    }
  }
  return true;
}

// Line of sight between two points, blocked by any cover rectangle.
export function hasLineOfSight(x1, y1, x2, y2, covers) {
  for (const c of covers) {
    if (segHitsRect(x1, y1, x2, y2, c)) return false;
  }
  return true;
}

// Circle (x,y,r) overlapping rectangle r?
export function circleHitsRect(x, y, r, rect) {
  const cx = clamp(x, rect.x, rect.x + rect.w);
  const cy = clamp(y, rect.y, rect.y + rect.h);
  return (x - cx) * (x - cx) + (y - cy) * (y - cy) < r * r;
}
