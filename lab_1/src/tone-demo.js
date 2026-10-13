// TEMPORARY (F1): play the audio engine without the camera, so it can be heard on the live page
// before hand tracking lands. Remove in F3: delete this file and its <script> tag in index.html.
import { createAudio } from "./audio.js";

const TEST_VOLUME = 0.3;
const LOWEST_HZ = 110; // A2; the slider spans three octaves up to A5 (880 Hz)
const PAD_LOW_HZ = 220; // pointer pad: bottom of the canvas; top is two octaves higher (880 Hz)

const panel = document.createElement("div");
panel.className = "tone-test";
panel.innerHTML = `
  <button type="button" style="background: transparent; border: 2px solid var(--accent);">▶ Test tone</button>
  <label style="display: block; margin-top: 12px;">Pitch
    <input type="range" min="0" max="36" step="any" value="24" style="width: min(320px, 60vw); vertical-align: middle;">
    <output>440 Hz</output>
  </label>
  <p style="margin: 8px 0 0; opacity: 0.7;">No camera? Press and drag on the dark box — up is higher.</p>`;
document.getElementById("start").after(panel);

const button = panel.querySelector("button");
const slider = panel.querySelector("input");
const readout = panel.querySelector("output");
const canvas = document.getElementById("canvas");

let audio = null;
let playing = false;
let padDown = false;

function sliderHz() {
  return LOWEST_HZ * 2 ** (Number(slider.value) / 12);
}

async function ensureAudio() {
  if (audio) return;
  audio = createAudio();
  audio.setFrequency(sliderHz());
  await audio.start();
}

function showError(err) {
  button.textContent = `No sound: ${err.message}`;
  button.disabled = true;
}

button.addEventListener("click", async () => {
  try {
    await ensureAudio();
    playing = !playing;
    audio.setVolume(playing ? TEST_VOLUME : 0);
    button.textContent = playing ? "■ Stop tone" : "▶ Test tone";
  } catch (err) {
    showError(err);
  }
});

slider.addEventListener("input", () => {
  const hz = sliderHz();
  readout.textContent = `${Math.round(hz)} Hz`;
  if (audio) audio.setFrequency(hz);
});

// Pointer pad on the canvas: same idea as the hand will be — height sets pitch.
function playPad(event) {
  const rect = canvas.getBoundingClientRect();
  const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
  const hz = PAD_LOW_HZ * 2 ** (2 * (1 - y));
  audio.setFrequency(hz);
  audio.setVolume(TEST_VOLUME);
  readout.textContent = `${Math.round(hz)} Hz`;
}

canvas.style.touchAction = "none"; // dragging on a phone plays instead of scrolling
canvas.addEventListener("pointerdown", async (event) => {
  canvas.setPointerCapture(event.pointerId);
  padDown = true;
  try {
    await ensureAudio();
  } catch (err) {
    showError(err);
    return;
  }
  if (padDown) playPad(event);
});
canvas.addEventListener("pointermove", (event) => {
  if (padDown && audio) playPad(event);
});
for (const type of ["pointerup", "pointercancel"]) {
  canvas.addEventListener(type, () => {
    padDown = false;
    if (audio && !playing) audio.setVolume(0);
  });
}
