[![make.fun](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/maezageryan-del/curtain-call-stage-heist/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/maezageryan-del/curtain-call-stage-heist/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

# CURTAIN CALL — steal the Star of the Stage

A top-down heist game set in the Grand Marlowe Theatre on opening night.
Slip through three acts — the Auditorium, Backstage, and the Stage itself —
steal the Star of the Stage diamond from its spotlight, and escape through
the stage door as the house erupts.

## The heist

- **Act 1 — The Auditorium:** seat rows, velvet ropes, and ushers sweeping
  the aisles with torch cones. Grab the box-office cashbox and the patron's
  sapphire, then slip backstage.
- **Act 2 — Backstage:** costume rails for cover, stagehands with lantern
  cones, trapdoors and a grand piano. Take the prop-room ruby and the leading
  lady's tiara, then step onto the stage.
- **Act 3 — The Stage:** the great followspot sweeps the boards like a
  searchlight, the stage manager patrols, and wing cameras watch the exits.
  Cut the footlights to make shadow, grab the diamond, and reach the stage
  door for the getaway.

## Mechanics

- **Vision cones with line of sight:** ushers, stagehands, cameras, and the
  followspot only see you inside their cone with a clear line — walls,
  seat rows, and costume rails block their gaze.
- **Suspicion, then a fair warning:** being seen raises suspicion
  (suspicion → investigate → search), which decays when you hide. At full
  suspicion you get a 2-second **SPOTTED!** warning to break line of sight
  before you are caught.
- **Tools at a cost:** `1` toss a rose to lure the nearest guard to a spot,
  `2` puff stage smoke to vanish for a few seconds, `3` cut the footlights
  to make a shadow zone (costs alarm). Stocks are limited and shown in the HUD.
- **Sound as a mechanic:** footsteps on the wooden stage ring out as visible
  noise rings; sneak to move quietly. A stage bell masks noise on a timer.
- **Alarm meter:** the HUD alarm follows the hottest suspicion and cools
  when nobody sees you.

## Controls

- **WASD / arrows** — move (or click to walk)
- **Mouse** — aim the rose toss
- **Shift** — sneak (slower, quieter, harder to spot)
- **E** — grab loot / interact
- **1 / 2 / 3** — rose lure / smoke puff / cut footlights
- **P** — pause · **R** — restart · **M** — mute

## Play it

Open `game/index.html` in desktop Chrome — the game starts immediately on
the first screen, no landing page. All art is drawn on canvas and all sound
is synthesised with WebAudio; the game makes no network requests.

## Layout

- `game/src/config.js` — tuning, palette, tool stocks
- `game/src/input.js` — keyboard and mouse
- `game/src/audio.js` — synthesised sound effects
- `game/src/levels.js` — the three acts (rooms, loot, patrols, cameras)
- `game/src/guards.js` — patrols, vision cones, suspicion
- `game/src/cameras.js` — wall cameras and the followspot
- `game/src/player.js` — the thief, noise rings, loot pickup
- `game/src/tools.js` — rose, smoke, footlights
- `game/src/render.js` — canvas drawing, HUD, overlays
- `game/src/game.js` — state machine, alarm, win/lose
- `game/src/shots.js` — deterministic screenshot staging
- `game/src/main.js` — boot and game loop
- `main.ts` — hands the game in (copies `game/` + `screenshots/`, writes `dossier.json`)

## License

MIT — see `LICENSE`.
