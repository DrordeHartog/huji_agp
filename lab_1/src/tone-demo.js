// TEMPORARY (F1): play the audio engine without the camera, so it can be heard on the live page
// before hand tracking lands. Remove in F3: delete this file and its <script> tag in index.html.
import { createAudio } from "./audio.js";

const TEST_VOLUME = 0.3;
const LOWEST_HZ = 110; // A2; the slider spans three octaves up to A5 (880 Hz)

const panel = document.createElement("div");
panel.className = "tone-test";
panel.innerHTML = `
  <button type="button" style="background: transparent; border: 2px solid var(--accent);">▶ Test tone</button>
  <label style="display: block; margin-top: 12px;">Pitch
    <input type="range" min="0" max="36" step="any" value="24" style="width: min(320px, 60vw); vertical-align: middle;">
    <output>440 Hz</output>
  </label>`;
document.getElementById("start").after(panel);

const button = panel.querySelector("button");
const slider = panel.querySelector("input");
const readout = panel.querySelector("output");

let audio = null;
let playing = false;

function sliderHz() {
  return LOWEST_HZ * 2 ** (Number(slider.value) / 12);
}

button.addEventListener("click", async () => {
  try {
    if (!audio) {
      audio = createAudio();
      audio.setFrequency(sliderHz());
      await audio.start();
    }
    playing = !playing;
    audio.setVolume(playing ? TEST_VOLUME : 0);
    button.textContent = playing ? "■ Stop tone" : "▶ Test tone";
  } catch (err) {
    button.textContent = `No sound: ${err.message}`;
    button.disabled = true;
  }
});

slider.addEventListener("input", () => {
  const hz = sliderHz();
  readout.textContent = `${Math.round(hz)} Hz`;
  if (audio) audio.setFrequency(hz);
});
