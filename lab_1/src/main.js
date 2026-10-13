import { createAudio } from "./audio.js";
import { startCamera } from "./camera.js";
import { createHandTracker } from "./hands.js";
import { drawFrame } from "./overlay.js";
import { handSize, handToSound } from "./control.js";

const startButton = document.getElementById("start");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const status = document.getElementById("status");
const ctx = canvas.getContext("2d");

function setStatus(text) {
  status.textContent = text;
}

// Live tracking values, for checking the tracking and tuning control.js by feel.
// y: 0 = top of the frame. Palm = average of wrist + the four knuckles.
const PALM = [0, 5, 9, 13, 17];
function describeHand(hand, volume, frequency) {
  const lm = hand.landmarks;
  const palmY = PALM.reduce((sum, i) => sum + lm[i].y, 0) / PALM.length;
  return [
    `tip y ${lm[8].y.toFixed(2)}`,
    `palm y ${palmY.toFixed(2)}`,
    `size ${handSize(hand).toFixed(2)}`,
    `vol ${volume.toFixed(2)}`,
    `${Math.round(frequency)} Hz`,
  ].join(" · ");
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
      setStatus(hands.length ? describeHand(hands[0], volume, frequency) : "No hand");
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
