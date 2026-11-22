// All canvas drawing for CURTAIN CALL. One job: turn the game state into
// the picture the judge sees — the theatre, the cones, the loot, the HUD.

import { PAL, W, H, HUD_H, clamp } from './config.js';

function conePath(ctx, x, y, angle, range, halfAngle) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - halfAngle, angle + halfAngle);
  ctx.closePath();
}

function drawCone(ctx, x, y, angle, range, halfAngle, fill, edge) {
  conePath(ctx, x, y, angle, range, halfAngle);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

// Deterministic speckle hash: the same tile always gets the same speck.
function speckHash(x, y) {
  let h = (x * 73856093) ^ (y * 19349663);
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}

// Floor texture: carpet runners and gold specks in the house, plank seams
// and knots on the stage boards, scuffs backstage — so the floor is a
// place, not a flat colour.
function drawFloorTexture(ctx, game) {
  if (game.act === 2) {
    ctx.strokeStyle = 'rgba(0,0,0,0.28)';
    ctx.lineWidth = 1;
    for (let x = 136; x < W - 90; x += 46) {
      ctx.beginPath();
      ctx.moveTo(x, HUD_H + 20);
      ctx.lineTo(x, H - 20);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    for (let y = 100; y < H - 40; y += 52) {
      for (let x = 110; x < W - 110; x += 92) {
        if (speckHash(x, y) > 0.72) {
          ctx.beginPath();
          ctx.ellipse(x, y, 7, 4, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    return;
  }
  // Carpet runners down the aisles, gold-trimmed.
  const aisles = [[280, 80], [600, 80], [920, 80]];
  for (const [ax, aw] of aisles) {
    ctx.fillStyle = '#4a0a1c';
    ctx.fillRect(ax, HUD_H + 20, aw, H - HUD_H - 40);
    ctx.fillStyle = PAL.goldDim;
    ctx.fillRect(ax, HUD_H + 20, 3, H - HUD_H - 40);
    ctx.fillRect(ax + aw - 3, HUD_H + 20, 3, H - HUD_H - 40);
    ctx.fillStyle = 'rgba(242,193,78,0.35)';
    for (let y = HUD_H + 40; y < H - 30; y += 44) {
      ctx.fillRect(ax + aw / 2 - 8, y, 16, 3);
    }
  }
  // Gold specks and dropped programmes on the house floor.
  for (let y = HUD_H + 30; y < H - 20; y += 26) {
    for (let x = 40; x < W - 40; x += 26) {
      const h = speckHash(x, y);
      if (h > 0.93) {
        ctx.fillStyle = 'rgba(242,193,78,0.5)';
        ctx.fillRect(x, y, 2, 2);
      } else if (h > 0.90) {
        ctx.fillStyle = 'rgba(245,230,200,0.5)';
        ctx.fillRect(x, y, 6, 4);
      }
    }
  }
  // Framed posters on the side walls.
  const posters = ['#7d1226', '#1f4d6b', '#6b2d5e', '#3d6b3a'];
  for (let i = 0; i < 4; i++) {
    const py = 150 + i * 130;
    for (const px of [4, W - 22]) {
      ctx.fillStyle = posters[i % posters.length];
      ctx.fillRect(px, py, 18, 52);
      ctx.strokeStyle = PAL.gold;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px + 1, py + 1, 16, 50);
      ctx.fillStyle = PAL.cream;
      ctx.fillRect(px + 5, py + 10, 8, 8);
      ctx.fillRect(px + 4, py + 26, 10, 2);
      ctx.fillRect(px + 4, py + 32, 10, 2);
    }
  }
}

// --- set pieces -----------------------------------------------------------

function drawCover(ctx, c, t) {
  if (c.kind === 'seats') {
    ctx.fillStyle = PAL.seat;
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.fillStyle = PAL.seatTop;
    const seats = Math.floor(c.w / 26);
    for (let i = 0; i < seats; i++) {
      const sx = c.x + 4 + i * 26;
      ctx.beginPath();
      ctx.arc(sx + 9, c.y + 17, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PAL.velvetBright;
      ctx.fillRect(sx, c.y + 4, 18, 8);
      ctx.fillStyle = PAL.seatTop;
    }
    ctx.fillStyle = 'rgba(242,193,78,0.25)';
    ctx.fillRect(c.x, c.y + c.h - 3, c.w, 2);
    // A few seats hold audience members — dark heads in the stalls.
    const hair = ['#2a1a12', '#4a3a28', '#6b6b6b', '#1a1a1a', '#7a5a3a'];
    for (let i = 0; i < seats; i++) {
      if (speckHash(c.x + i * 26, c.y) > 0.68) {
        ctx.fillStyle = hair[Math.floor(speckHash(c.y, c.x + i) * hair.length)];
        ctx.beginPath();
        ctx.arc(c.x + 13 + i * 26, c.y + 8, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    return;
  }
  if (c.kind === 'rail') {
    ctx.fillStyle = '#2c1c10';
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.fillStyle = PAL.velvet;
    ctx.fillRect(c.x - 3, c.y, c.w + 6, 6);
    const dresses = ['#7d1226', '#1f4d6b', '#c9a35a', '#3d6b3a', '#6b2d5e'];
    for (let i = 0; i < Math.floor(c.h / 34); i++) {
      ctx.fillStyle = dresses[i % dresses.length];
      const dy = c.y + 10 + i * 34;
      ctx.beginPath();
      ctx.moveTo(c.x + c.w / 2, dy);
      ctx.lineTo(c.x - 2, dy + 28);
      ctx.lineTo(c.x + c.w + 2, dy + 28);
      ctx.closePath();
      ctx.fill();
    }
    return;
  }
  if (c.kind === 'crate') {
    ctx.fillStyle = PAL.wood;
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.strokeStyle = PAL.woodLight;
    ctx.lineWidth = 3;
    ctx.strokeRect(c.x + 3, c.y + 3, c.w - 6, c.h - 6);
    ctx.beginPath();
    ctx.moveTo(c.x, c.y);
    ctx.lineTo(c.x + c.w, c.y + c.h);
    ctx.moveTo(c.x + c.w, c.y);
    ctx.lineTo(c.x, c.y + c.h);
    ctx.stroke();
    ctx.fillStyle = PAL.gold;
    ctx.font = 'bold 13px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('PROPS', c.x + c.w / 2, c.y + c.h / 2 + 5);
    return;
  }
  if (c.kind === 'booth') {
    ctx.fillStyle = '#3a2415';
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.fillStyle = PAL.goldDim;
    ctx.fillRect(c.x, c.y, c.w, 8);
    ctx.fillStyle = PAL.cream;
    ctx.font = 'bold 12px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('BOX OFFICE', c.x + c.w / 2, c.y + 34);
    return;
  }
  if (c.kind === 'mirror') {
    ctx.fillStyle = '#2a2a33';
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.fillStyle = 'rgba(180,200,230,0.35)';
    ctx.fillRect(c.x + 8, c.y + 8, c.w - 16, c.h - 16);
    ctx.strokeStyle = PAL.gold;
    ctx.lineWidth = 3;
    ctx.strokeRect(c.x + 2, c.y + 2, c.w - 4, c.h - 4);
    return;
  }
  if (c.kind === 'piano') {
    ctx.fillStyle = '#120a08';
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.fillStyle = '#1d1008';
    ctx.beginPath();
    ctx.moveTo(c.x, c.y);
    ctx.lineTo(c.x + c.w, c.y);
    ctx.lineTo(c.x + c.w - 20, c.y + c.h);
    ctx.lineTo(c.x, c.y + c.h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f5e6c8';
    for (let i = 0; i < 14; i++) ctx.fillRect(c.x + 8 + i * 8, c.y + c.h - 16, 7, 12);
    ctx.fillStyle = PAL.gold;
    ctx.beginPath();
    ctx.arc(c.x + c.w - 30, c.y + 22, 10, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  if (c.kind === 'settee') {
    ctx.fillStyle = PAL.velvet;
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.fillStyle = PAL.velvetBright;
    ctx.fillRect(c.x, c.y, c.w, 12);
    ctx.fillStyle = PAL.gold;
    ctx.fillRect(c.x, c.y + c.h - 6, c.w, 4);
    return;
  }
  if (c.kind === 'curtainSide') {
    ctx.fillStyle = PAL.curtain;
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.fillStyle = PAL.curtainDark;
    for (let i = 0; i < c.h / 28; i++) {
      ctx.fillRect(c.x + (i % 2) * 14, c.y + i * 28, 10, 28);
    }
    ctx.fillStyle = PAL.gold;
    ctx.fillRect(c.x + c.w - 4, c.y, 4, c.h);
    return;
  }
  ctx.fillStyle = '#333';
  ctx.fillRect(c.x, c.y, c.w, c.h);
}

function drawDecor(ctx, d, t, game) {
  if (d.kind === 'chandelier') {
    const sway = Math.sin(t * 0.7) * 3;
    ctx.save();
    ctx.translate(d.x + sway, d.y);
    ctx.strokeStyle = PAL.goldDim;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -HUD_H - 4);
    ctx.lineTo(0, 0);
    ctx.stroke();
    const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 90);
    glow.addColorStop(0, 'rgba(255, 220, 130, 0.35)');
    glow.addColorStop(1, 'rgba(255, 220, 130, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 90, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PAL.gold;
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff6d8';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 26, Math.sin(a) * 14, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return;
  }
  if (d.kind === 'curtain') {
    ctx.fillStyle = PAL.curtain;
    ctx.fillRect(24, HUD_H + 2, 220, 16);
    ctx.fillRect(W - 244, HUD_H + 2, 220, 16);
    ctx.fillStyle = PAL.curtainDark;
    for (let i = 0; i < 10; i++) {
      ctx.fillRect(30 + i * 22, HUD_H + 2, 8, 16);
      ctx.fillRect(W - 238 + i * 22, HUD_H + 2, 8, 16);
    }
    ctx.fillStyle = PAL.gold;
    ctx.fillRect(24, HUD_H + 16, 220, 3);
    ctx.fillRect(W - 244, HUD_H + 16, 220, 3);
    return;
  }
  if (d.kind === 'rope') {
    ctx.strokeStyle = PAL.goldDim;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(d.x - 40, d.y);
    ctx.quadraticCurveTo(d.x, d.y + 16, d.x + 40, d.y);
    ctx.stroke();
    ctx.fillStyle = PAL.velvetBright;
    ctx.fillRect(d.x - 42, d.y - 14, 5, 16);
    ctx.fillRect(d.x + 37, d.y - 14, 5, 16);
    return;
  }
  if (d.kind === 'trapdoor') {
    ctx.strokeStyle = PAL.woodLight;
    ctx.lineWidth = 3;
    ctx.strokeRect(d.x - 34, d.y - 24, 68, 48);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(d.x - 34, d.y - 24, 68, 48);
    ctx.fillStyle = PAL.goldDim;
    ctx.beginPath();
    ctx.arc(d.x, d.y, 6, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  if (d.kind === 'footlights') {
    for (let i = 0; i < 16; i++) {
      const fx = 60 + i * 76;
      const on = !game.lightsCut;
      const flick = on ? 0.75 + Math.sin(t * 3 + i) * 0.15 : 0.08;
      const g = ctx.createRadialGradient(fx, 664, 2, fx, 664, 46);
      g.addColorStop(0, `rgba(255, 220, 140, ${flick})`);
      g.addColorStop(1, 'rgba(255, 220, 140, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(fx, 664, 46, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = on ? '#ffd98a' : '#3a3325';
      ctx.beginPath();
      ctx.arc(fx, 664, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }
  if (d.kind === 'spotlight') {
    const pulse = 0.5 + Math.sin(t * 2.2) * 0.2;
    const g = ctx.createRadialGradient(d.x, d.y, 6, d.x, d.y, 110);
    g.addColorStop(0, `rgba(255, 250, 220, ${0.55 * pulse})`);
    g.addColorStop(1, 'rgba(255, 250, 220, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(d.x, d.y, 110, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
}

// --- loot, people, effects ------------------------------------------------

function drawLoot(ctx, loot, t) {
  for (const l of loot) {
    if (l.taken) continue;
    const tw = 0.6 + Math.sin(t * 3 + l.x) * 0.25;
    const g = ctx.createRadialGradient(l.x, l.y, 2, l.x, l.y, l.diamond ? 46 : 30);
    g.addColorStop(0, `rgba(255, 215, 90, ${0.55 * tw})`);
    g.addColorStop(1, 'rgba(255, 215, 90, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(l.x, l.y, l.diamond ? 46 : 30, 0, Math.PI * 2);
    ctx.fill();
    if (l.diamond) {
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(Math.sin(t * 1.5) * 0.1);
      ctx.fillStyle = '#cfe9ff';
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(16, -6);
      ctx.lineTo(10, 14);
      ctx.lineTo(-10, 14);
      ctx.lineTo(-16, -6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(16, -6);
      ctx.lineTo(0, -2);
      ctx.lineTo(-16, -6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#7fb8e8';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = '#ffe9a8';
      ctx.font = 'bold 12px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('THE STAR OF THE STAGE', l.x, l.y - 32);
    } else {
      ctx.fillStyle = PAL.gold;
      ctx.beginPath();
      ctx.arc(l.x, l.y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff3c4';
      ctx.beginPath();
      ctx.arc(l.x - 3, l.y - 3, 3, 0, Math.PI * 2);
      ctx.fill();
      // Sparkles.
      ctx.fillStyle = `rgba(255, 240, 180, ${tw})`;
      for (let i = 0; i < 4; i++) {
        const a = t * 1.4 + i * 1.7;
        ctx.fillRect(l.x + Math.cos(a) * 16 - 1, l.y + Math.sin(a) * 16 - 1, 2, 2);
      }
    }
  }
}

function drawGuard(ctx, g, t) {
  // Vision cone.
  const alert = g.state !== 'patrol';
  drawCone(ctx, g.x, g.y, g.angle, g.range, g.halfAngle,
    alert ? 'rgba(255, 90, 60, 0.30)' : PAL.cone, alert ? 'rgba(255,120,90,0.6)' : PAL.coneEdge);
  // Body: a little usher in a dark uniform with a gold torch.
  ctx.save();
  ctx.translate(g.x, g.y);
  ctx.fillStyle = '#1c1420';
  ctx.beginPath();
  ctx.arc(0, 0, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = g.color;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = g.color;
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  // Torch / lantern beam nub.
  const tx = Math.cos(g.angle) * 18;
  const ty = Math.sin(g.angle) * 18;
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath();
  ctx.arc(tx, ty, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (alert) {
    ctx.fillStyle = '#ff6b5e';
    ctx.font = 'bold 16px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('?', g.x, g.y - 22);
  }
}

function drawCamera(ctx, cam, t) {
  drawCone(ctx, cam.x, cam.y, cam.angle, cam.range, cam.halfAngle,
    'rgba(255, 120, 90, 0.20)', 'rgba(255, 120, 90, 0.45)');
  ctx.save();
  ctx.translate(cam.x, cam.y);
  ctx.rotate(cam.angle);
  ctx.fillStyle = '#22242c';
  ctx.fillRect(-6, -6, 16, 12);
  ctx.fillStyle = '#444';
  ctx.fillRect(8, -4, 8, 8);
  ctx.restore();
  const on = Math.floor(cam.blink * 2) % 2 === 0;
  ctx.fillStyle = on ? '#ff3b30' : '#5a1010';
  ctx.beginPath();
  ctx.arc(cam.x, cam.y - 8, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlayer(ctx, p, t, hidden) {
  // Shadow of the thief.
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + 10, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.translate(p.x, p.y);
  // Cloak.
  ctx.fillStyle = hidden ? '#3a3f5e' : '#232030';
  ctx.beginPath();
  ctx.moveTo(0, -13);
  ctx.quadraticCurveTo(12, 0, 9, 12);
  ctx.lineTo(-9, 12);
  ctx.quadraticCurveTo(-12, 0, 0, -13);
  ctx.fill();
  ctx.strokeStyle = PAL.goldDim;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Hooded head.
  ctx.fillStyle = '#191420';
  ctx.beginPath();
  ctx.arc(0, -4, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = hidden ? '#8fb8ff' : '#ffd98a';
  ctx.beginPath();
  ctx.arc(0, -4, 3, 0, Math.PI * 2);
  ctx.fill();
  // Facing tick.
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(p.dirX * 12, p.dirY * 12);
  ctx.stroke();
  ctx.restore();
  if (hidden) {
    ctx.fillStyle = 'rgba(200,210,255,0.8)';
    ctx.font = 'bold 11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('HIDDEN', p.x, p.y - 22);
  }
}

// --- HUD and overlays -----------------------------------------------------

function drawHUD(ctx, game) {
  ctx.fillStyle = '#12081a';
  ctx.fillRect(0, 0, W, HUD_H);
  ctx.fillStyle = PAL.gold;
  ctx.fillRect(0, HUD_H - 3, W, 3);
  ctx.fillStyle = PAL.cream;
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText('CURTAIN CALL', 18, 26);
  ctx.fillStyle = PAL.gold;
  ctx.font = '13px Georgia, serif';
  ctx.fillText(game.level.name, 18, 46);
  // Alarm meter.
  const ax = 330;
  const aw = 260;
  ctx.fillStyle = '#2a0d12';
  ctx.fillRect(ax, 12, aw, 16);
  ctx.fillStyle = game.alarm > 70 ? '#ff2e2e' : game.alarm > 40 ? '#ff8a2e' : PAL.alarm;
  ctx.fillRect(ax, 12, (aw * clamp(game.alarm, 0, 100)) / 100, 16);
  ctx.strokeStyle = PAL.gold;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(ax, 12, aw, 16);
  ctx.fillStyle = PAL.cream;
  ctx.font = 'bold 12px Georgia, serif';
  ctx.fillText('ALARM', ax, 42);
  ctx.fillText(`${Math.round(game.alarm)}%`, ax + aw + 8, 26);
  // Suspicion pips.
  ctx.fillStyle = game.suspicion > 80 ? '#ff5a4d' : '#ffb347';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.fillText(`SUSPICION ${Math.round(game.suspicion)}%`, ax + aw + 64, 42);
  // Loot + quota.
  ctx.fillStyle = PAL.gold;
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'right';
  ctx.fillText(`LOOT ${game.lootCount}/${game.level.quota}  ◆ ${game.diamond ? 'STAR ✓' : 'STAR —'}`, W - 16, 26);
  ctx.font = '13px Georgia, serif';
  ctx.fillStyle = PAL.cream;
  ctx.fillText(`[1] Rose ×${game.tools.rose}  [2] Smoke ×${game.tools.smoke}  [3] Lights ×${game.tools.lights}`, W - 16, 46);
  ctx.textAlign = 'left';
}

function drawHint(ctx, game) {
  ctx.fillStyle = 'rgba(10,6,16,0.72)';
  ctx.fillRect(0, H - 26, W, 26);
  ctx.fillStyle = PAL.cream;
  ctx.font = '13px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(game.level.hint, W / 2, H - 8);
  ctx.textAlign = 'left';
}

// --- main render ----------------------------------------------------------

export function render(ctx, game, t) {
  const level = game.level;
  // Floor: dark auditorium boards with a subtle checker.
  ctx.fillStyle = game.act === 2 ? '#171021' : PAL.floor;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.02)';
  const tile = 64;
  for (let y = HUD_H; y < H; y += tile) {
    for (let x = 0; x < W; x += tile) {
      if (((x / tile) + (y / tile)) % 2 === 0) ctx.fillRect(x, y, tile, tile);
    }
  }
  // Stage boards in act 3.
  if (game.act === 2) {
    ctx.fillStyle = PAL.stage;
    ctx.fillRect(90, HUD_H + 20, W - 180, H - HUD_H - 40);
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1;
    for (let y = HUD_H + 40; y < H; y += 26) {
      ctx.beginPath();
      ctx.moveTo(90, y);
      ctx.lineTo(W - 90, y);
      ctx.stroke();
    }
  }
  drawFloorTexture(ctx, game);
  // Walls.
  ctx.fillStyle = '#0d0714';
  ctx.fillRect(0, HUD_H, W, 8);
  ctx.fillRect(0, H - 8, W, 8);
  ctx.fillRect(0, HUD_H, 24, H - HUD_H);
  ctx.fillRect(W - 24, HUD_H, 24, H - HUD_H);
  ctx.fillStyle = PAL.goldDim;
  ctx.fillRect(0, HUD_H + 8, W, 2);
  ctx.fillRect(0, H - 10, W, 2);

  // Exit door.
  const ex = level.exit;
  ctx.fillStyle = game.exitOpen ? '#2f7a3a' : '#5a1f1f';
  ctx.fillRect(ex.x, ex.y, ex.w, ex.h);
  ctx.strokeStyle = PAL.gold;
  ctx.lineWidth = 2;
  ctx.strokeRect(ex.x, ex.y, ex.w, ex.h);
  ctx.fillStyle = '#ffe9a8';
  ctx.font = 'bold 11px Georgia, serif';
  ctx.textAlign = 'center';
  const label = game.act === 2 ? 'STAGE DOOR' : ex.label;
  ctx.fillText(label, ex.x + ex.w / 2, ex.y - 8);
  if (game.act === 2) {
    ctx.fillStyle = 'rgba(255,233,168,0.85)';
    ctx.fillText('EXIT →', ex.x - 8, ex.y + ex.h / 2 + 4);
  }

  // Decor behind cover.
  for (const d of level.decor) drawDecor(ctx, d, t, game);

  // Shadow zones (cut footlights). Labels are drawn later, after the
  // cover, so set pieces never sit on top of the text.
  for (const z of game.tools.shadowZones) {
    ctx.fillStyle = PAL.shadow;
    ctx.fillRect(z.x, z.y, z.w, z.h);
    ctx.strokeStyle = 'rgba(150,170,255,0.5)';
    ctx.strokeRect(z.x, z.y, z.w, z.h);
  }

  // Smoke clouds.
  for (const c of game.tools.smokeClouds) {
    const g = ctx.createRadialGradient(c.x, c.y, 4, c.x, c.y, c.r);
    g.addColorStop(0, 'rgba(210,210,220,0.55)');
    g.addColorStop(1, 'rgba(210,210,220,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Followspot cone (drawn under the guards so the sweep reads).
  if (game.followspot) {
    drawCone(ctx, game.followspot.x, game.followspot.y, game.followspot.angle,
      game.followspot.range, game.followspot.halfAngle, PAL.spot, 'rgba(255,244,200,0.6)');
    ctx.fillStyle = '#fff6d8';
    ctx.beginPath();
    ctx.arc(game.followspot.x, game.followspot.y, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cameras, then guards, then loot, then cover, then the thief.
  for (const cam of game.cameras) drawCamera(ctx, cam, t);
  for (const g of game.guards) drawGuard(ctx, g, t);
  drawLoot(ctx, level.loot, t);
  for (const c of level.covers) drawCover(ctx, c, t);
  for (const z of game.tools.shadowZones) {
    ctx.fillStyle = 'rgba(200,210,255,0.9)';
    ctx.font = 'bold 12px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('SHADOW — the footlights are out', z.x + z.w / 2, z.y + z.h - 10);
  }

  // Roses in flight.
  for (const r of game.tools.roses) {
    ctx.fillStyle = '#c2253d';
    ctx.beginPath();
    ctx.arc(r.x, r.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff7a8a';
    ctx.beginPath();
    ctx.arc(r.x - 2, r.y - 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Noise rings from footsteps.
  for (const ring of game.player.rings) {
    ctx.strokeStyle = `rgba(255, 220, 140, ${Math.max(0, ring.life * 0.7)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawPlayer(ctx, game.player, t, game.player.hidden);

  // Suspicion ring over the thief when being seen.
  if (game.suspicion > 5 && game.state === 'playing') {
    ctx.strokeStyle = game.suspicion > 80 ? '#ff3b30' : '#ffb347';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(game.player.x, game.player.y, 24 + Math.sin(t * 6) * 2,
      -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * game.suspicion) / 100);
    ctx.stroke();
  }

  // Stage bell masking indicator.
  if (game.bellTimer > 0) {
    ctx.fillStyle = 'rgba(255,233,168,0.9)';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(`♪ THE STAGE BELL MASKS YOUR NOISE (${Math.ceil(game.bellTimer)}s) ♪`, W / 2, HUD_H + 34);
    ctx.textAlign = 'left';
  }

  drawHUD(ctx, game);
  drawHint(ctx, game);

  // SPOTTED! warning.
  if (game.state === 'spotted') {
    const flash = Math.floor(t * 6) % 2 === 0;
    ctx.fillStyle = flash ? 'rgba(255,40,40,0.22)' : 'rgba(255,40,40,0.10)';
    ctx.fillRect(0, HUD_H, W, H - HUD_H);
    ctx.fillStyle = '#ff3b30';
    ctx.font = 'bold 44px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPOTTED!', W / 2, 200);
    ctx.fillStyle = '#ffe9a8';
    ctx.font = 'bold 18px Georgia, serif';
    ctx.fillText('Break line of sight — NOW!', W / 2, 234);
    ctx.textAlign = 'left';
  }

  if (game.state === 'paused') {
    ctx.fillStyle = 'rgba(8,4,16,0.75)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = PAL.cream;
    ctx.font = 'bold 40px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('INTERMISSION', W / 2, H / 2 - 10);
    ctx.font = '18px Georgia, serif';
    ctx.fillText('Paused — press P to return to the heist', W / 2, H / 2 + 26);
    ctx.textAlign = 'left';
  }

  if (game.state === 'caught') {
    ctx.fillStyle = 'rgba(20,2,6,0.82)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ff5a4d';
    ctx.font = 'bold 44px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('CAUGHT!', W / 2, H / 2 - 20);
    ctx.fillStyle = PAL.cream;
    ctx.font = '18px Georgia, serif';
    ctx.fillText('The ushers have you. The curtain falls on this thief.', W / 2, H / 2 + 16);
    ctx.fillText('Press R to try the heist again', W / 2, H / 2 + 48);
    ctx.textAlign = 'left';
  }

  if (game.state === 'won') {
    ctx.fillStyle = 'rgba(10,6,16,0.72)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = PAL.gold;
    ctx.font = 'bold 44px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('CURTAIN CALL!', W / 2, H / 2 - 40);
    ctx.fillStyle = PAL.cream;
    ctx.font = '20px Georgia, serif';
    ctx.fillText('The Star of the Stage is yours — and the house erupts.', W / 2, H / 2);
    ctx.font = '17px Georgia, serif';
    ctx.fillText(`Loot: ${game.lootCount} pieces · Alarm peaked at ${Math.round(game.alarmPeak)}% · Press R to steal again`, W / 2, H / 2 + 34);
    ctx.textAlign = 'left';
  }
}
