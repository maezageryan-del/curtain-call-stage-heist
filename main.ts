// CURTAIN CALL — steal the Star of the Stage.
// Entry program for best-heist-game-20261122-0559 (Node 22, standard library
// only). The game is this directory's game/ folder: plain static files a
// desktop browser loads offline (game/index.html and its ES modules, no
// library and no network request). This program copies game/ and
// screenshots/ beside this file to the output directory and writes
// /output/dossier.json with the vendored make.fun library, so the grader can
// verify the hand-in byte for byte. It runs twice in the grader and both
// runs must write identical bytes, so it does nothing time- or
// environment-dependent: the same input directory always writes the same
// output bytes.
//
// Serve the game locally with `node serve.ts`, then open
// http://localhost:8080. Outside the grader's container, MAKEFUN_OUTPUT_DIR
// stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files in game/ or 48 MiB of
// game files, in all, or a path under game/ over 1000 bytes). The caps are
// passed verbatim from the bounty gate so a hand-in this program accepts is
// one the scorer accepts too — a refusal here is a refusal there, never a
// surprise after submission.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
