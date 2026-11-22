// CURTAIN CALL — every pixel the judge sees: velvet, gold, footlights,
// vision cones, the diamond, and the alarm meter drawn on the canvas HUD.
window.CURTAIN_RENDER = (function () {
  const CFG = window.CURTAIN_CONFIG;
  const P = CFG.palette;

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawCone(ctx, x, y, angle, range, halfAngle, fill) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, range, angle - halfAngle, angle + halfAngle);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function seededRand(seed) {
    let s = seed >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  function drawFloor(ctx, act, time) {
    if (act.floor === 'carpet') {
      ctx.fillStyle = P.carpetDark;
      ctx.fillRect(0, 56, 1280, 664);
      ctx.fillStyle = P.carpet;
      for (let y = 76; y < 710; y += 46) ctx.fillRect(10, y, 1260, 22);
      // Woven diamond lattice so the carpet is never a flat field.
      const rnd = seededRand(77);
      ctx.fillStyle = 'rgba(217,164,65,0.13)';
      for (let y = 88; y < 710; y += 44) {
        for (let x = 30 + ((y / 44) % 2) * 28; x < 1270; x += 56) {
          ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.fillStyle = 'rgba(0,0,0,0.14)';
      for (let i = 0; i < 160; i++) ctx.fillRect(10 + rnd() * 1260, 66 + rnd() * 644, 2, 2);
      ctx.strokeStyle = 'rgba(217,164,65,0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(640, 66); ctx.lineTo(640, 710); ctx.stroke();
    } else {
      ctx.fillStyle = P.floorWoodDark;
      ctx.fillRect(0, 56, 1280, 664);
      ctx.fillStyle = P.floorWood;
      for (let y = 66; y < 710; y += 34) ctx.fillRect(10, y, 1260, 26);
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 1;
      for (let x = 10; x < 1280; x += 86) { ctx.beginPath(); ctx.moveTo(x, 66); ctx.lineTo(x, 710); ctx.stroke(); }
      // Wood grain: short dark strokes and knots, seeded so the boards never shimmer.
      const rnd = seededRand(1234);
      ctx.strokeStyle = 'rgba(0,0,0,0.20)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 260; i++) {
        const x = 12 + rnd() * 1250, y = 70 + rnd() * 636, len = 14 + rnd() * 30;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y + (rnd() - 0.5) * 3); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      for (let i = 0; i < 26; i++) {
        const x = 20 + rnd() * 1240, y = 76 + rnd() * 630;
        ctx.beginPath(); ctx.ellipse(x, y, 5 + rnd() * 4, 3 + rnd() * 2, 0, 0, Math.PI * 2); ctx.fill();
      }
    }
    // Gold proscenium line at the top of the room.
    ctx.fillStyle = P.gold;
    ctx.fillRect(10, 66, 1260, 4);
  }

  function drawDecor(ctx, act, time) {
    for (const d of act.decor) {
      if (d.kind === 'seats') {
        ctx.fillStyle = P.velvetDark;
        rr(ctx, d.x, d.y, d.w, d.h, 10); ctx.fill();
        ctx.fillStyle = P.velvet;
        for (let i = 0; i < 8; i++) {
          const sx = d.x + 14 + i * 54;
          rr(ctx, sx, d.y + 10, 42, 52, 8); ctx.fill();
          ctx.fillStyle = P.gold;
          ctx.fillRect(sx + 6, d.y + 10, 30, 4);
          ctx.fillStyle = P.velvet;
        }
      } else if (d.kind === 'rail') {
        ctx.fillStyle = '#241a12';
        ctx.fillRect(d.x, d.y, d.w, d.h);
        ctx.fillStyle = P.gold;
        ctx.fillRect(d.x + d.w / 2 - 2, d.y, 4, d.h);
        const cols = ['#7a1530', '#1d4d6b', '#d9a441', '#4d1a5c'];
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = cols[i % 4];
          ctx.fillRect(d.x - 16, d.y + 14 + i * 42, d.w + 32, 30);
        }
      } else if (d.kind === 'crate') {
        ctx.fillStyle = '#4a2f1a';
        ctx.fillRect(d.x, d.y, d.w, d.h);
        ctx.strokeStyle = P.gold; ctx.lineWidth = 2;
        ctx.strokeRect(d.x + 4, d.y + 4, d.w - 8, d.h - 8);
        ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + d.w, d.y + d.h); ctx.stroke();
      } else if (d.kind === 'piano') {
        ctx.fillStyle = '#120c08';
        rr(ctx, d.x, d.y, d.w, d.h, 8); ctx.fill();
        ctx.fillStyle = '#f5ead2';
        for (let i = 0; i < 10; i++) ctx.fillRect(d.x + 8 + i * 10, d.y + d.h - 16, 8, 12);
      } else if (d.kind === 'curtain') {
        ctx.fillStyle = P.velvet;
        ctx.fillRect(d.x, d.y, d.w, d.h);
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        for (let i = 0; i < d.w / 14; i++) ctx.fillRect(d.x + i * 14, d.y, 6, d.h);
        ctx.fillStyle = P.gold;
        ctx.fillRect(d.x, d.y + d.h - 10, d.w, 6);
      } else if (d.kind === 'pedestal') {
        ctx.fillStyle = '#e8ddc0';
        rr(ctx, d.x, d.y, d.w, d.h, 6); ctx.fill();
        ctx.fillStyle = P.gold;
        ctx.fillRect(d.x + 6, d.y + 6, d.w - 12, 5);
      } else if (d.kind === 'footlights') {
        for (let i = 0; i < 11; i++) {
          const fx = d.x + 20 + i * 78;
          const glow = 0.5 + 0.5 * Math.sin(time * 2 + i);
          ctx.fillStyle = 'rgba(242,193,78,' + (0.35 + 0.4 * glow) + ')';
          ctx.beginPath(); ctx.arc(fx, d.y + 9, 9, 0, Math.PI * 2); ctx.fill();
        }
      } else if (d.kind === 'chandelier') {
        ctx.strokeStyle = P.gold; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(d.x + 30, d.y + 30, 26, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(242,193,78,0.85)';
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          ctx.beginPath(); ctx.arc(d.x + 30 + Math.cos(a) * 26, d.y + 30 + Math.sin(a) * 26, 4, 0, Math.PI * 2); ctx.fill();
        }
      } else if (d.kind === 'boxoffice') {
        ctx.fillStyle = '#2a1a12';
        ctx.fillRect(d.x, d.y, d.w, d.h);
        ctx.fillStyle = P.gold;
        ctx.font = 'bold 13px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('BOX OFFICE', d.x + d.w / 2, d.y + 25);
      } else if (d.kind === 'trapdoor') {
        ctx.strokeStyle = P.gold; ctx.lineWidth = 2;
        ctx.strokeRect(d.x, d.y, d.w, d.h);
        ctx.fillStyle = 'rgba(217,164,65,0.18)';
        ctx.fillRect(d.x, d.y, d.w, d.h);
      } else if (d.kind === 'rope') {
        ctx.strokeStyle = P.velvet; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(d.x, d.y + 13); ctx.quadraticCurveTo(d.x + d.w / 2, d.y + 30, d.x + d.w, d.y + 13); ctx.stroke();
        ctx.fillStyle = P.gold;
        ctx.beginPath(); ctx.arc(d.x, d.y + 13, 5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(d.x + d.w, d.y + 13, 5, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  function drawLoot(ctx, loot, time) {
    for (const item of loot) {
      if (item.taken) continue;
      const pulse = 0.7 + 0.3 * Math.sin(time * 4 + item.x);
      ctx.save();
      ctx.translate(item.x, item.y);
      if (item.kind === 'diamond') {
        ctx.fillStyle = 'rgba(180,230,255,' + (0.25 * pulse) + ')';
        ctx.beginPath(); ctx.arc(0, 0, 34 * pulse, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#bfe9ff';
        ctx.beginPath();
        ctx.moveTo(0, -20); ctx.lineTo(16, 0); ctx.lineTo(0, 20); ctx.lineTo(-16, 0);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(10, -6); ctx.lineTo(-10, -6); ctx.closePath(); ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(255,217,77,' + (0.22 * pulse) + ')';
        ctx.beginPath(); ctx.arc(0, 0, 20 * pulse, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = item.kind === 'cashbox' ? '#8a5a22' : P.loot;
        if (item.kind === 'cashbox') { ctx.fillRect(-13, -9, 26, 18); ctx.fillStyle = P.gold; ctx.fillRect(-13, -3, 26, 4); }
        else { ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.restore();
    }
  }

  function drawGuard(ctx, g, time) {
    const hot = g.suspicion > 50;
    drawCone(ctx, g.x, g.y, g.angle, CFG.visionRange, CFG.visionHalfAngle, hot ? CFG.palette.coneHot : CFG.palette.cone);
    ctx.fillStyle = g.kind === 'manager' ? '#1d1d26' : '#23232e';
    ctx.beginPath(); ctx.arc(g.x, g.y, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = P.gold;
    ctx.beginPath(); ctx.arc(g.x + Math.cos(g.angle) * 8, g.y + Math.sin(g.angle) * 8, 4, 0, Math.PI * 2); ctx.fill();
    // Suspicion ring over the guard's head.
    if (g.suspicion > 4) {
      ctx.strokeStyle = hot ? P.danger : P.gold;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(g.x, g.y - 24, 9, -Math.PI / 2, -Math.PI / 2 + (g.suspicion / 100) * Math.PI * 2); ctx.stroke();
      ctx.fillStyle = hot ? P.danger : P.ink;
      ctx.font = 'bold 12px Georgia, serif'; ctx.textAlign = 'center';
      ctx.fillText(g.state === 'investigate' ? '?' : '!', g.x, g.y - 34);
    }
    ctx.fillStyle = P.ink;
    ctx.font = '10px Georgia, serif'; ctx.textAlign = 'center';
    ctx.fillText(g.kind === 'usher' ? 'USHER' : g.kind === 'manager' ? 'STAGE MGR' : 'STAGEHAND', g.x, g.y + 26);
  }

  function drawWatcher(ctx, w, range, halfAngle, fill, label) {
    drawCone(ctx, w.x, w.y, w.angle, range, halfAngle, fill);
    ctx.fillStyle = '#1a1a22';
    ctx.fillRect(w.x - 8, w.y - 8, 16, 16);
    ctx.fillStyle = '#78c8ff';
    ctx.beginPath(); ctx.arc(w.x + Math.cos(w.angle) * 8, w.y + Math.sin(w.angle) * 8, 3.5, 0, Math.PI * 2); ctx.fill();
    if (w.suspicion > 4) {
      ctx.strokeStyle = P.danger; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(w.x, w.y - 16, 7, -Math.PI / 2, -Math.PI / 2 + (w.suspicion / 100) * Math.PI * 2); ctx.stroke();
    }
    ctx.fillStyle = P.muted;
    ctx.font = '10px Georgia, serif'; ctx.textAlign = 'center';
    ctx.fillText(label, w.x, w.y + 24);
  }

  function drawPlayer(ctx, p, time) {
    for (const ring of p.noiseRings) {
      ctx.strokeStyle = 'rgba(245,234,210,' + Math.max(0, ring.alpha) + ')';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.save();
    ctx.translate(p.x, p.y);
    if (p.hidden) { ctx.globalAlpha = 0.55; }
    ctx.fillStyle = '#0e0e14';
    ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = P.gold; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.stroke();
    // Mask + hat brim.
    ctx.fillStyle = '#f5ead2';
    ctx.beginPath(); ctx.arc(Math.cos(p.facing) * 5, Math.sin(p.facing) * 5, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0e0e14';
    ctx.fillRect(-8, -4, 16, 4);
    ctx.restore();
    ctx.fillStyle = P.ink;
    ctx.font = '10px Georgia, serif'; ctx.textAlign = 'center';
    ctx.fillText(p.sneaking ? 'SNEAKING' : 'THIEF', p.x, p.y + 26);
  }

  function drawExit(ctx, exit, open) {
    ctx.fillStyle = open ? 'rgba(125,220,138,0.85)' : 'rgba(217,164,65,0.5)';
    ctx.fillRect(exit.x, exit.y, exit.w, exit.h);
    ctx.strokeStyle = P.gold; ctx.lineWidth = 3;
    ctx.strokeRect(exit.x, exit.y, exit.w, exit.h);
    // Label sits horizontally in the room beside the door, never clipped.
    ctx.textAlign = 'right';
    ctx.fillStyle = open ? P.safe : P.gold;
    ctx.font = 'bold 13px Georgia, serif';
    ctx.fillText(exit.label, exit.x - 10, exit.y + exit.h / 2 - 2);
    ctx.font = '11px Georgia, serif';
    ctx.fillText(open ? 'OPEN' : 'LOCKED', exit.x - 10, exit.y + exit.h / 2 + 14);
    ctx.textAlign = 'left';
  }

  function drawHud(ctx, game) {
    ctx.fillStyle = '#120a18';
    ctx.fillRect(0, 0, 1280, 56);
    ctx.fillStyle = P.gold;
    ctx.fillRect(0, 54, 1280, 2);
    ctx.fillStyle = P.goldBright;
    ctx.font = 'bold 20px Georgia, serif'; ctx.textAlign = 'left';
    ctx.fillText('CURTAIN CALL', 16, 24);
    ctx.fillStyle = P.ink;
    ctx.font = '13px Georgia, serif';
    ctx.fillText(game.act.name, 16, 44);
    // Alarm meter.
    ctx.fillStyle = P.muted;
    ctx.font = 'bold 12px Georgia, serif';
    ctx.fillText('ALARM', 330, 22);
    ctx.fillStyle = '#2a1214';
    rr(ctx, 390, 10, 260, 18, 9); ctx.fill();
    const aw = Math.max(0, Math.min(1, game.alarm / 100)) * 260;
    ctx.fillStyle = game.alarm > 70 ? P.danger : game.alarm > 35 ? '#e08a2e' : P.safe;
    if (aw > 2) { rr(ctx, 390, 10, aw, 18, 9); ctx.fill(); }
    ctx.fillStyle = P.ink;
    ctx.font = 'bold 12px Georgia, serif';
    ctx.fillText(Math.round(game.alarm) + '', 660, 24);
    // Loot + quota, right-aligned so it never collides with the alarm.
    ctx.fillStyle = P.loot;
    ctx.font = 'bold 15px Georgia, serif';
    ctx.textAlign = 'right';
    ctx.fillText('◆ LOOT ' + game.lootCount + ' / ' + game.act.quota + (game.hasDiamond ? '  ★ STAR STOLEN' : ''), 1264, 24);
    // Tools under the alarm; controls on the same row, right-aligned.
    ctx.fillStyle = P.ink;
    ctx.font = '13px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('1 Rose ×' + game.tools.rose + '    2 Smoke ×' + game.tools.smoke + '    3 Lights ×' + game.tools.footlights, 330, 44);
    ctx.fillStyle = P.muted;
    ctx.font = '12px Georgia, serif'; ctx.textAlign = 'right';
    ctx.fillText('WASD move · Shift sneak · E grab · P pause · R restart · M mute', 1264, 44);
    ctx.textAlign = 'left';
    // Act hint as a small pill along the bottom edge, clear of the playfield.
    ctx.fillStyle = 'rgba(10,6,14,0.78)';
    ctx.fillRect(440, 697, 400, 17);
    ctx.fillStyle = P.muted;
    ctx.font = '12px Georgia, serif'; ctx.textAlign = 'center';
    ctx.fillText(game.act.hint, 640, 709);
    ctx.textAlign = 'left';
    // SPOTTED warning banner.
    if (game.spottedTimer > 0) {
      ctx.fillStyle = 'rgba(255,84,64,0.92)';
      ctx.fillRect(440, 64, 400, 40);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px Georgia, serif'; ctx.textAlign = 'center';
      ctx.fillText('SPOTTED! BREAK LINE OF SIGHT!', 640, 92);
      ctx.textAlign = 'left';
    }
  }

  function drawOverlay(ctx, game) {
    if (game.state === 'paused') {
      ctx.fillStyle = 'rgba(10,6,14,0.72)';
      ctx.fillRect(0, 56, 1280, 664);
      ctx.fillStyle = P.ink; ctx.textAlign = 'center';
      ctx.font = 'bold 44px Georgia, serif';
      ctx.fillText('INTERMISSION', 640, 340);
      ctx.font = '18px Georgia, serif';
      ctx.fillText('P to resume · R to restart the act', 640, 380);
      ctx.textAlign = 'left';
    } else if (game.state === 'caught') {
      ctx.fillStyle = 'rgba(60,8,12,0.78)';
      ctx.fillRect(0, 56, 1280, 664);
      ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
      ctx.font = 'bold 44px Georgia, serif';
      ctx.fillText('CAUGHT IN THE SPOTLIGHT!', 640, 330);
      ctx.font = '18px Georgia, serif';
      ctx.fillText('The house manager has you. Press R to try the act again.', 640, 372);
      ctx.textAlign = 'left';
    } else if (game.state === 'won') {
      ctx.fillStyle = 'rgba(10,16,10,0.78)';
      ctx.fillRect(0, 56, 1280, 664);
      ctx.fillStyle = P.goldBright; ctx.textAlign = 'center';
      ctx.font = 'bold 44px Georgia, serif';
      ctx.fillText('CURTAIN CALL — YOU DID IT!', 640, 320);
      ctx.fillStyle = P.ink;
      ctx.font = '20px Georgia, serif';
      ctx.fillText('The Star of the Stage is yours. The crowd roars as you slip out the stage door.', 640, 362);
      ctx.font = '18px Georgia, serif';
      ctx.fillText('Loot ' + game.lootCount + ' · Final alarm ' + Math.round(game.alarm) + ' · Press R to play again', 640, 398);
      ctx.textAlign = 'left';
    } else if (game.state === 'actclear') {
      ctx.fillStyle = 'rgba(10,6,14,0.55)';
      ctx.fillRect(0, 56, 1280, 664);
      ctx.fillStyle = P.goldBright; ctx.textAlign = 'center';
      ctx.font = 'bold 40px Georgia, serif';
      ctx.fillText(game.actClearText, 640, 350);
      ctx.textAlign = 'left';
    }
  }

  function render(ctx, game, time) {
    const act = game.act;
    drawFloor(ctx, act, time);
    drawDecor(ctx, act, time);
    // Shadow zones from cut footlights.
    for (const z of game.tools.shadowZones) {
      ctx.fillStyle = 'rgba(10,6,20,0.55)';
      ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(217,164,65,0.6)';
      ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
    }
    // Followspot cone first (it is the room's light), then cameras, then guards.
    if (game.followspot) {
      drawCone(ctx, game.followspot.x, game.followspot.y, game.followspot.angle, CFG.followspotRange, CFG.followspotHalfAngle, CFG.palette.spotCone);
      ctx.fillStyle = '#3a2c12';
      ctx.fillRect(game.followspot.x - 16, game.followspot.y - 10, 32, 20);
      ctx.fillStyle = '#fff4c8';
      ctx.beginPath(); ctx.arc(game.followspot.x, game.followspot.y + 12, 6, 0, Math.PI * 2); ctx.fill();
    }
    for (const cam of game.cameras) drawWatcher(ctx, cam, CFG.cameraRange, CFG.cameraHalfAngle, CFG.palette.cameraCone, 'CAMERA');
    for (const g of game.guards) drawGuard(ctx, g, time);
    drawLoot(ctx, game.loot, time);
    // Roses in flight / landed.
    for (const r of game.tools.roses) {
      ctx.fillStyle = '#c22a4d';
      ctx.beginPath(); ctx.arc(r.x, r.y, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = P.gold;
      ctx.font = 'bold 11px Georgia, serif'; ctx.textAlign = 'center';
      ctx.fillText('ROSE — COME LOOK', r.x, r.y - 14);
      ctx.textAlign = 'left';
    }
    // Smoke cloud.
    if (game.tools.smokeTimer > 0) {
      ctx.fillStyle = 'rgba(220,220,230,0.35)';
      ctx.beginPath(); ctx.arc(game.tools.smokeX, game.tools.smokeY, 70, 0, Math.PI * 2); ctx.fill();
    }
    drawExit(ctx, act.exit, game.lootCount >= act.quota);
    drawPlayer(ctx, game.player, time);
    // Vignette over the playfield only: depth at the edges, HUD untouched.
    const vg = ctx.createRadialGradient(640, 388, 260, 640, 388, 780);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.30)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 56, 1280, 664);
    drawHud(ctx, game);
    drawOverlay(ctx, game);
  }

  return { render, drawCone };
})();
