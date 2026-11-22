// The game itself: state machine, alarm, detection, loot, win and lose.
// One job: own the rules and tie the modules together.

import { clamp, dist } from './config.js';
import { buildLevel } from './levels.js';
import { Guard, Followspot, updateSuspicion } from './guards.js';
import { Camera } from './cameras.js';
import { Player } from './player.js';
import { Tools } from './tools.js';

export class Game {
  constructor(input, audio) {
    this.input = input;
    this.audio = audio;
    this.state = 'playing'; // playing | spotted | paused | caught | won
    this.act = 0;
    this.time = 0;
    this.suspicion = 0;
    this.alarm = 0;
    this.alarmPeak = 0;
    this.spottedTimer = 0;
    this.lootCount = 0;
    this.diamond = false;
    this.exitOpen = false;
    this.lightsCut = false;
    this.bellTimer = 12; // the stage bell masks noise for the first seconds
    this.bellCooldown = 0;
    this.frozen = false; // screenshot staging freezes patrols
    this.player = new Player(640, 660);
    this.tools = new Tools();
    this.loadAct(0);
  }

  loadAct(act) {
    this.act = act;
    this.level = buildLevel(act);
    this.guards = this.level.guards.map((g) => new Guard(g));
    this.cameras = this.level.cameras.map((c) => new Camera(c));
    this.followspot = this.level.followspot ? new Followspot(this.level.followspot) : null;
    this.player.reset(this.level.spawn.x, this.level.spawn.y);
    this.tools.reset();
    this.suspicion = 0;
    this.spottedTimer = 0;
    this.exitOpen = false;
    this.lightsCut = false;
    this.state = 'playing';
    this.hint = this.level.hint;
  }

  restart() {
    this.lootCount = 0;
    this.diamond = false;
    this.alarm = 0;
    this.alarmPeak = 0;
    this.bellTimer = 12;
    this.bellCooldown = 0;
    this.loadAct(0);
  }

  // The exit opens once the act's loot quota is met (act 3: the diamond).
  refreshExit() {
    if (this.level.quotaDiamond) {
      this.exitOpen = this.diamond;
    } else {
      this.exitOpen = this.lootCount >= this.level.quota;
    }
  }

  grab() {
    for (const l of this.level.loot) {
      if (l.taken) continue;
      if (dist(this.player.x, this.player.y, l.x, l.y) < 42) {
        l.taken = true;
        this.lootCount += 1;
        if (l.diamond) {
          this.diamond = true;
          this.audio.diamond();
        } else {
          this.audio.pickup();
        }
        this.refreshExit();
        return l;
      }
    }
    return null;
  }

  useTool(key) {
    const p = this.player;
    if (key === 'Digit1') {
      const tx = this.input.mouse.x;
      const ty = this.input.mouse.y;
      return this.tools.tossRose(p.x, p.y, tx, ty, this.guards, this.audio);
    }
    if (key === 'Digit2') {
      const ok = this.tools.puffSmoke(p.x, p.y, this.audio);
      if (ok) p.smokeTimer = 4;
      return ok;
    }
    if (key === 'Digit3') {
      const ok = this.tools.cutFootlights(this.audio);
      if (ok) {
        this.lightsCut = true;
        this.alarm = clamp(this.alarm + 20, 0, 100);
        this.alarmPeak = Math.max(this.alarmPeak, this.alarm);
      }
      return ok;
    }
    return false;
  }

  update(dt) {
    this.time += dt;
    if (this.state === 'paused' || this.state === 'caught' || this.state === 'won') {
      return;
    }
    if (this.frozen) return;

    // Stage bell: masks footsteps on a timer, then rings again.
    if (this.bellTimer > 0) {
      this.bellTimer -= dt;
      if (this.bellTimer <= 0) this.bellCooldown = 18;
    } else if (this.bellCooldown > 0) {
      this.bellCooldown -= dt;
      if (this.bellCooldown <= 0) {
        this.bellTimer = 8;
        this.audio.bell();
      }
    }
    const bellMasking = this.bellTimer > 0;

    // Keys.
    if (this.input.tapped('KeyP')) {
      this.state = 'paused';
      return;
    }
    if (this.input.tapped('KeyR')) { this.restart(); return; }
    if (this.input.tapped('KeyM')) this.audio.toggleMute();
    if (this.input.tapped('KeyE')) this.grab();
    for (const k of ['Digit1', 'Digit2', 'Digit3']) {
      if (this.input.tapped(k)) this.useTool(k);
    }

    this.player.update(dt, this.input, this.level.covers, this.audio, bellMasking);
    this.tools.update(dt);
    for (const g of this.guards) g.update(dt, this.player, this.level.covers);
    for (const c of this.cameras) c.update(dt);
    if (this.followspot) this.followspot.update(dt);

    // Detection: hidden in smoke or shadow, nobody sees you.
    this.player.hidden = this.player.inShadow(this.tools.shadowZones);
    let seen = false;
    if (!this.player.hidden) {
      const sneak = this.player.sneaking;
      for (const g of this.guards) {
        if (g.sees(this.player, this.level.covers, sneak)) { seen = true; break; }
      }
      if (!seen) {
        for (const c of this.cameras) {
          if (c.sees(this.player, this.level.covers)) { seen = true; break; }
        }
      }
      if (!seen && this.followspot && this.followspot.sees(this.player, this.level.covers, sneak)) {
        seen = true;
      }
    }

    const before = this.suspicion;
    this.suspicion = updateSuspicion(this.suspicion, seen, dt, this.player.sneaking);
    if (seen && before < 60 && this.suspicion >= 60) this.audio.sting();

    if (this.state === 'spotted') {
      if (!seen) {
        // Broke line of sight in time: the alarm jumps, suspicion falls.
        this.state = 'playing';
        this.spottedTimer = 0;
        this.suspicion = 60;
        this.alarm = clamp(this.alarm + 25, 0, 100);
        this.alarmPeak = Math.max(this.alarmPeak, this.alarm);
        this.audio.alarm();
      } else {
        this.spottedTimer -= dt;
        if (this.spottedTimer <= 0) {
          this.state = 'caught';
          this.audio.caught();
        }
      }
    } else if (this.suspicion >= 100) {
      // The fair caught moment: 2 seconds to break line of sight.
      this.state = 'spotted';
      this.spottedTimer = 2;
      this.audio.sting();
    }

    // Exit: reach the door with the quota met.
    this.refreshExit();
    const ex = this.level.exit;
    if (this.exitOpen &&
        this.player.x > ex.x - 6 && this.player.x < ex.x + ex.w + 6 &&
        this.player.y > ex.y - 6 && this.player.y < ex.y + ex.h + 6) {
      if (this.act < 2) {
        this.audio.door();
        this.loadAct(this.act + 1);
      } else {
        this.state = 'won';
        this.audio.applause();
      }
    }
  }

  // Resume from pause.
  resume() {
    if (this.state === 'paused') this.state = 'playing';
  }

  // The flat state headless checks and screenshots read.
  snapshot() {
    return {
      state: this.state,
      act: this.act,
      actName: this.level.name,
      loot: this.lootCount,
      lootQuota: this.level.quota,
      diamond: this.diamond,
      alarm: Math.round(this.alarm),
      suspicion: Math.round(this.suspicion),
      exitOpen: this.exitOpen,
      tools: { rose: this.tools.rose, smoke: this.tools.smoke, lights: this.tools.lights },
      muted: this.audio.muted,
      time: Math.round(this.time * 10) / 10,
    };
  }
}
