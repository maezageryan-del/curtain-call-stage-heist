// The thief's tools — each one costs something. One job: rose, smoke and
// footlights, their stocks and their effects.

export class Tools {
  constructor() {
    this.rose = 3; // lures the nearest guard to the landing spot
    this.smoke = 2; // stage smoke hides you for ~4 seconds
    this.lights = 2; // cut the footlights: shadow, but +alarm
    this.roses = []; // roses in flight: {x, y, tx, ty, t}
    this.smokeClouds = []; // {x, y, r, life}
    this.shadowZones = []; // {x, y, w, h, life}
  }

  reset() {
    this.rose = 3;
    this.smoke = 2;
    this.lights = 2;
    this.roses = [];
    this.smokeClouds = [];
    this.shadowZones = [];
  }

  // Toss a rose toward (tx, ty). On landing, the nearest guard walks over.
  tossRose(fromX, fromY, tx, ty, guards, audio) {
    if (this.rose <= 0) return false;
    this.rose -= 1;
    this.roses.push({ x: fromX, y: fromY, tx, ty, t: 0, dur: 0.45 });
    audio.rose();
    this._pendingLure = { tx, ty, guards };
    return true;
  }

  // Puff of stage smoke at the thief's feet.
  puffSmoke(x, y, audio) {
    if (this.smoke <= 0) return false;
    this.smoke -= 1;
    this.smokeClouds.push({ x, y, r: 70, life: 4 });
    audio.smoke();
    return true;
  }

  // Cut the footlights: a wide shadow zone across the stage floor,
  // but the house notices the lights go out.
  cutFootlights(audio) {
    if (this.lights <= 0) return false;
    this.lights -= 1;
    this.shadowZones.push({ x: 180, y: 540, w: 920, h: 120, life: 12 });
    audio.lights();
    return true;
  }

  update(dt) {
    for (const r of this.roses) {
      r.t += dt;
      const k = Math.min(1, r.t / r.dur);
      r.x = r.x + (r.tx - r.x) * k * 0.6;
      r.y = r.y + (r.ty - r.y) * k * 0.6;
      if (k >= 1 && !r.landed) {
        r.landed = true;
        // The nearest guard goes to look at the rose.
        if (this._pendingLure) {
          let best = null;
          let bestD = Infinity;
          for (const g of this._pendingLure.guards) {
            const d = Math.hypot(g.x - r.tx, g.y - r.ty);
            if (d < bestD) { bestD = d; best = g; }
          }
          if (best) best.lureTo(r.tx, r.ty);
          this._pendingLure = null;
        }
      }
    }
    this.roses = this.roses.filter((r) => !r.landed || r.t < r.dur + 1.2);
    for (const c of this.smokeClouds) c.life -= dt;
    this.smokeClouds = this.smokeClouds.filter((c) => c.life > 0);
    for (const z of this.shadowZones) z.life -= dt;
    this.shadowZones = this.shadowZones.filter((z) => z.life > 0);
  }
}
