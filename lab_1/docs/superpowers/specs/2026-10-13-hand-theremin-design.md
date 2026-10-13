# Hand Theremin — Design Spec

**Date:** 2026-10-13
**Course:** HUJI Agentic Programming, Lab 1 (pair project)
**One sentence:** A browser theremin you play with one hand in front of the webcam — hand height sets pitch, distance to the camera sets volume (closer = louder).

## Constraints

- Runs entirely in the browser: HTML, CSS, JavaScript. No server, backend, database, or API keys.
- Lives in the `lab_1/` folder of the public `DrordeHartog/huji_agp` repo, published by its Pages workflow from `main` at `https://drordehartog.github.io/huji_agp/lab_1/`.
- No build step. Plain ES modules loaded directly by the browser.
- Demo-able in 90 seconds.

## Tech

- **Hand tracking:** MediaPipe `@mediapipe/tasks-vision` `HandLandmarker`, loaded from jsDelivr CDN at a pinned exact version, `runningMode: "VIDEO"`, `numHands: 1`. Returns 21 landmarks per hand, coordinates normalized to 0..1.
- **Audio:** Web Audio API — one `OscillatorNode` (sine) → `GainNode` → destination. The oscillator runs continuously; sound on/off is done only by ramping gain (`setTargetAtTime`, ~50 ms) to avoid clicks.
- **Camera:** `navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })`. Requires HTTPS or `localhost` — local dev uses `python3 -m http.server`.
- Camera and AudioContext are both started inside the Start button click handler (browser autoplay/permission rules).

## File layout

```
index.html          page: title, Start button, <video>, <canvas>, status line
style.css
src/main.js         wiring + frame loop (requestAnimationFrame)
src/audio.js        Web Audio wrapper
src/camera.js       getUserMedia wrapper
src/hands.js        MediaPipe wrapper
src/overlay.js      draws video + landmarks on the canvas
src/control.js      pure functions: hand → sound parameters
```

## Module interfaces (the contract both partners code against)

```js
// src/audio.js
export function createAudio() → {
  start(): Promise<void>      // create/resume AudioContext; call from a click
  setVolume(v: number): void  // 0..1, smoothly ramped
  setFrequency(hz: number): void  // smoothly ramped
}

// src/camera.js
export async function startCamera(videoEl: HTMLVideoElement): Promise<void>
  // throws Error with a user-readable message on denial / no camera

// src/hands.js
export async function createHandTracker() → {
  detect(videoEl: HTMLVideoElement, timestampMs: number): Hand[]
}
// Hand = { landmarks: Array<{x, y, z}> (length 21), handedness: "Left" | "Right" }

// src/overlay.js
export function drawFrame(ctx: CanvasRenderingContext2D, videoEl, hands: Hand[]): void
  // draws the mirrored video and a dot per landmark

// src/control.js   (pure, no DOM — easy to test)
export function handToSound(hands: Hand[]) → { volume: number, frequency: number }
export function handSize(hand: Hand): number   // wrist → middle knuckle, frame units (bigger = closer)
```

`main.js` loop each frame: `hands = tracker.detect(video, now)` → `drawFrame(ctx, video, hands)` → `{volume, frequency} = handToSound(hands)` → `audio.setVolume(volume)`, `audio.setFrequency(frequency)` → update status line.

## Error handling

Show a readable on-screen message (not a blank page) for: camera permission denied, no camera found, MediaPipe failed to load.

## Features and parallel split

Work happens on feature branches merged into `main` via PR. Because each module is its own file and the interfaces above are fixed, partners rarely touch the same file.

| # | Feature | Owner | Files | Depends on |
|---|---------|-------|-------|------------|
| F0 | **Skeleton** — `index.html`, `style.css`, `main.js` with stub modules that satisfy the interfaces; Start button; status line | Together (~10 min) | all, stubs | — |
| F1 | **Audio engine** — real `audio.js`; a temporary test button that plays/stops a tone | Partner A | `src/audio.js` | F0 |
| F2 | **Camera + hand tracking + overlay** — real `camera.js`, `hands.js`, `overlay.js`; dots on hand | Partner B | `src/camera.js`, `src/hands.js`, `src/overlay.js` | F0 |
| F3 | **MVP: hand on = note on** — `handToSound` returns `{volume: 0.3, frequency: 440}` if a hand is present, else `{volume: 0, ...}`; deploy to Pages and test the live URL | Together | `src/control.js`, `main.js` | F1, F2 |
| F4 | **Pitch from height** — index fingertip `y` → frequency | Partner A | `src/control.js` (pitch part) | F3 |
| F5 | **Volume from distance** — hand size in the frame (wrist → middle knuckle; bigger = closer) → volume, closer = louder. Changed from pinch on 2026-10-13: pinching moved the index fingertip and bent the pitch | Partner B | `src/control.js` (volume part) | F3 |
| F6+ | Stretch, pick one at a time: scale snapping + note name display; pitch guide lines; glow/particle visuals; open-palm gesture cycles waveform | Split as you go | — | F4, F5 |

F1 ∥ F2 and F4 ∥ F5 are the parallel pairs. To keep F4/F5 conflict-free, `control.js` is structured as two functions from the start: `handToFrequency(hand)` and `handToVolume(hand)`, each owned by one partner, with `handToSound` combining them.

## Step 1 scope (what "done" means right now)

F0–F3 only: one fixed note (A4, 440 Hz) at fixed volume (0.3) plays while a hand is visible and fades out when it is not, with no pops, working on the GitHub Pages URL.

**Out of scope for step 1:** pitch control, volume control, scales, visuals beyond landmark dots, gestures.

## Testing

- Manual, in Chrome, on `localhost` and then on the Pages URL: tone starts when a hand enters, stops when it leaves, no clicks; error messages appear when camera permission is denied.
- `control.js` is pure and can be checked from the browser console with fake `Hand` objects; no test framework for this size.

## Known pitfalls (tracked)

- Mirrored video: overlay must mirror the drawing to match; MediaPipe `handedness` is from the camera's point of view (irrelevant while using one hand).
- Tracking jitter → smooth values before audio (relevant from F4/F5).
- Hand closer to camera looks bigger — F5 uses exactly this as the volume control.
- First load downloads ~8 MB model — open the page once before the demo.
