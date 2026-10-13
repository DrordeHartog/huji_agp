import { createAudio } from "./audio.js";
import { startCamera } from "./camera.js";
import { createHandTracker } from "./hands.js";
import { drawFrame } from "./overlay.js";
import { handToSound } from "./control.js";

const startButton = document.getElementById("start");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const status = document.getElementById("status");
const ctx = canvas.getContext("2d");

function setStatus(text) {
  status.textContent = text;
}

async function start() {
  startButton.disabled = true;
  setStatus("Starting…");
  try {
    const audio = createAudio();
    await audio.start();
    await startCamera(video);
    const tracker = await createHandTracker();
    startButton.hidden = true;

    function frame(now) {
      const hands = tracker.detect(video, now);
      drawFrame(ctx, video, hands);
      const { volume, frequency } = handToSound(hands);
      audio.setVolume(volume);
      audio.setFrequency(frequency);
      setStatus(hands.length ? `Hand detected — playing ${Math.round(frequency)} Hz` : "No hand");
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  } catch (err) {
    setStatus(`Error: ${err.message}`);
    startButton.disabled = false;
  }
}

startButton.addEventListener("click", start);
setStatus("Press Start, then show your hand to the camera.");
