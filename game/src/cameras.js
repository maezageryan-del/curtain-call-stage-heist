// Wall cameras: fixed mounts that sweep their cones back and forth.
// One job: the unblinking eyes on the walls.

import { angleDiff, dist, hasLineOfSight } from './config.js';

export class Camera {
  constructor(def) {
    this.x = def.x;
    this.y = def.y;
    this.baseAngle = def.baseAngle;
    this.sweep = def.sweep;
    this.speed = def.speed;
    this.range = def.range;
    this.halfAngle = def.halfAngle;
    this.t = Math.random() * 6;
    this.angle = def.baseAngle;
    this.blink = 0; // red recording light blink timer
  }

  update(dt) {
    this.t += dt;
    this.angle = this.baseAngle + Math.sin(this.t * this.speed) * this.sweep;
    this.blink += dt;
  }

  sees(player, covers) {
    const d = dist(this.x, this.y, player.x, player.y);
    if (d > this.range) return false;
    const a = Math.atan2(player.y - this.y, player.x - this.x);
    if (Math.abs(angleDiff(this.angle, a)) > this.halfAngle) return false;
    if (!hasLineOfSight(this.x, this.y, player.x, player.y, covers)) return false;
    return true;
  }
}
