// The thief. One job: movement, sneaking, footsteps, and noise rings.

import { circleHitsRect, clamp, dist, W, H, HUD_H } from './config.js';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = 13;
    this.speed = 175;
    this.sneakSpeed = 95;
    this.dirX = 0;
    this.dirY = 1;
    this.moving = false;
    this.sneaking = false;
    this.stepTimer = 0;
    this.rings = []; // visible noise rings from footsteps
    this.clickTarget = null; // click-to-walk destination
    this.smokeTimer = 0; // seconds of smoke cover remaining
    this.hidden = false; // inside smoke or footlight shadow
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.rings = [];
    this.clickTarget = null;
    this.smokeTimer = 0;
    this.hidden = false;
  }

  update(dt, input, covers, audio, bellMasking) {
    this.sneaking = input.sneak();
    const speed = this.sneaking ? this.sneakSpeed : this.speed;
    let vx = 0;
    let vy = 0;
    const mv = input.moveVector();
    if (mv.x !== 0 || mv.y !== 0) {
      vx = mv.x;
      vy = mv.y;
      this.clickTarget = null;
    } else if (input.mouse.clicked) {
      this.clickTarget = { x: input.mouse.clickX, y: input.mouse.clickY };
    }
    if (this.clickTarget) {
      const d = dist(this.x, this.y, this.clickTarget.x, this.clickTarget.y);
      if (d < 6) {
        this.clickTarget = null;
      } else {
        vx = (this.clickTarget.x - this.x) / d;
        vy = (this.clickTarget.y - this.y) / d;
      }
    }
    this.moving = vx !== 0 || vy !== 0;
    if (this.moving) {
      this.dirX = vx;
      this.dirY = vy;
      // Axis-separated movement so the thief slides along cover.
      const nx = this.x + vx * speed * dt;
      if (!this.hitsCover(nx, this.y, covers)) this.x = nx;
      const ny = this.y + vy * speed * dt;
      if (!this.hitsCover(this.x, ny, covers)) this.y = ny;
      this.x = clamp(this.x, 30, W - 30);
      this.y = clamp(this.y, HUD_H + 14, H - 26);
      // Footsteps: a soft knock, and a visible ring on the wooden stage.
      this.stepTimer -= dt;
      if (this.stepTimer <= 0) {
        this.stepTimer = this.sneaking ? 0.55 : 0.38;
        audio.step(this.sneaking);
        if (!this.sneaking && !bellMasking) {
          this.rings.push({ x: this.x, y: this.y, r: 8, max: 64, life: 0.9 });
        }
      }
    }
    // Noise rings expand and fade.
    for (const ring of this.rings) {
      ring.r += 90 * dt;
      ring.life -= dt;
    }
    this.rings = this.rings.filter((r) => r.life > 0);
    if (this.smokeTimer > 0) this.smokeTimer -= dt;
  }

  hitsCover(x, y, covers) {
    for (const c of covers) {
      if (circleHitsRect(x, y, this.r, c)) return true;
    }
    return false;
  }

  // Is the thief inside a shadow zone (smoke or cut footlights)?
  inShadow(shadowZones) {
    if (this.smokeTimer > 0) return true;
    for (const z of shadowZones) {
      if (this.x > z.x && this.x < z.x + z.w && this.y > z.y && this.y < z.y + z.h) return true;
    }
    return false;
  }
}
