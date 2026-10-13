# Hand Theremin — working notes for agents

Browser-only theremin: one hand in front of the webcam, height = pitch, pinch = volume.
Spec: `docs/superpowers/specs/2026-10-13-hand-theremin-design.md` — read it first; its **Module interfaces** section is the contract.

## Rules

- Browser only: HTML/CSS/JS, no server, backend, database, or API keys. No build step — plain ES modules.
- All URLs relative (`src/x.js`, never `/src/x.js`) — GitHub Pages serves this folder under `/huji_agp/lab_1/`.
- Do not change a module's exported signatures without agreeing with the other partner; update the spec if you do.
- Stay inside the files you own for your feature (table below). Touch `main.js` / `index.html` only in "Together" features.

## Ownership

| Feature | Owner | Files |
|---|---|---|
| F1 Audio engine | Partner A | `src/audio.js` |
| F2 Camera + hand tracking + overlay | Partner B | `src/camera.js`, `src/hands.js`, `src/overlay.js` |
| F4 Pitch from height | Partner A | `handToFrequency` in `src/control.js` |
| F5 Volume from pinch | Partner B | `handToVolume` in `src/control.js` |

## Workflow

- Repo: `https://github.com/DrordeHartog/huji_agp` (public). Lab 1 is the `lab_1/` folder — a normal folder, not a submodule. Other `lab_#` folders are submodules; don't touch them.
- Branch from `main` per feature: `lab1-f1-audio`, `lab1-f2-hands`, … → PR into `main`. The repo's Pages workflow (`.github/workflows/pages.yml`) deploys on every push to `main`; live at https://drordehartog.github.io/huji_agp/lab_1/.
- Run locally from inside `lab_1/`: `python3 -m http.server 8000` → http://localhost:8000 (camera needs localhost/HTTPS; `file://` won't work).
- Tests: `npm test` (Node built-in runner; covers pure `src/control.js`). Camera/audio are checked by hand in Chrome.
