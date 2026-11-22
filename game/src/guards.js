// Guards: patrol, vision cones, suspicion. One job: the people who can
// catch you, and how they see.

import { angleDiff, clamp, dist, hasLineOfSight } from './config.js';

export class Guard {
  constructor(def) {
    this.kind = def.kind;
    this.name = def.name;
    this.waypoints = def.waypoints;
    this.speed = def.speed;
    this.range = def.range;
    this.halfAngle = def.halfAngle;
    this.color = def.color;
    this.light = def.light;
    this.x = def.waypoints[0][0];
    this.y = def.waypoints[0][1];
    this.wp = 1;
    this.angle = Math.PI / 2; // facing down the boards by default
    this.pauseTimer = 0; // seconds standing still, scanning
    this.state = 'patrol'; // patrol | investigate | search
    this.target = null; // {x, y} being investigated
    this.stateTimer = 0;
    this.sawTimer = 0; // how long the player has been in this cone
  }

  // Walk the patrol route, pausing at each waypoint to scan the room.
  update(dt, player, covers) {
    if (this.pauseTimer > 0) {
      this.pauseTimer -= dt;
      // Slow scan while paused: sweep the torch across the room.
      this.angle += Math.sin(performance.now() / 900 + this.x) * 0.15 * dt;
      return;
    }
    if (this.state === 'investigate' && this.target) {
      const d = dist(this.x, this.y, this.target.x, this.target.y);
      if (d > 12) {
        const a = Math.atan2(this.target.y - this.y, this.target.x - this.x);
        this.angle = a;
        this.x += Math.cos(a) * this.speed * 1.15 * dt;
        this.y += Math.sin(a) * this.speed * 1.15 * dt;
      } else {
        this.state = 'search';
        this.stateTimer = 3;
        this.pauseTimer = 3;
      }
      return;
    }
    if (this.state === 'search') {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        this.state = 'patrol';
        this.target = null;
      }
      return;
    }
    // Patrol: head for the next waypoint.
    const [tx, ty] = this.waypoints[this.wp];
    const d = dist(this.x, this.y, tx, ty);
    if (d < 8) {
      this.wp = (this.wp + 1) % this.waypoints.length;
      this.pauseTimer = 1.6; // stop and look around at each end
      return;
    }
    const a = Math.atan2(ty - this.y, tx - this.x);
    this.angle = a;
    this.x += Math.cos(a) * this.speed * dt;
    this.y += Math.sin(a) * this.speed * dt;
  }

  // Is the player inside this guard's vision cone right now?
  sees(player, covers, sneak) {
    const d = dist(this.x, this.y, player.x, player.y);
    const range = sneak ? this.range * 0.7 : this.range;
    if (d > range) return false;
    const a = Math.atan2(player.y - this.y, player.x - this.x);
    if (Math.abs(angleDiff(this.angle, a)) > this.halfAngle) return false;
    if (!hasLineOfSight(this.x, this.y, player.x, player.y, covers)) return false;
    return true;
  }

  // Called when a rose lands: walk over and have a look.
  lureTo(x, y) {
    this.state = 'investigate';
    this.target = { x, y };
    this.pauseTimer = 0;
  }
}

// The followspot: a giant sweeping cone from the lighting rig. It is a
// rhythm hazard — the whole stage breathes with it.
export class Followspot {
  constructor(def) {
    this.x = def.x;
    this.y = def.y;
    this.range = def.range;
    this.halfAngle = def.halfAngle;
    this.speed = def.speed;
    this.amp = def.amp;
    this.t = 0;
    this.angle = Math.PI / 2;
  }

  update(dt) {
    this.t += dt;
    this.angle = Math.PI / 2 + Math.sin(this.t * this.speed) * this.amp;
  }

  sees(player, covers, sneak) {
    const d = dist(this.x, this.y, player.x, player.y);
    const range = sneak ? this.range * 0.8 : this.range;
    if (d > range) return false;
    const a = Math.atan2(player.y - this.y, player.x - this.x);
    if (Math.abs(angleDiff(this.angle, a)) > this.halfAngle) return false;
    if (!hasLineOfSight(this.x, this.y, player.x, player.y, covers)) return false;
    return true;
  }
}

// Shared suspicion model: suspicion rises while any watcher sees the
// player and decays while unseen. Returns the new suspicion value.
export function updateSuspicion(suspicion, seen, dt, sneak) {
  if (seen) {
    const rate = sneak ? 28 : 45;
    return clamp(suspicion + rate * dt, 0, 100);
  }
  return clamp(suspicion - 26 * dt, 0, 100);
}
