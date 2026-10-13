// Pure mapping from detected hands to sound parameters.
// F4 (Partner A) owns handToFrequency; F5 (Partner B) owns handSize + handToVolume.

const BASE_FREQUENCY = 440; // A4
const INDEX_FINGERTIP = 8; // MediaPipe hand landmark index

// Pitch from height, exponential over two octaves: index fingertip at the top of the
// frame (y = 0) → 880 Hz, middle → 440 Hz, bottom (y = 1) → 220 Hz. Off-frame y is
// clamped; a missing or malformed landmark gives 440 Hz, never NaN.
export function handToFrequency(hand) {
  const y = hand?.landmarks?.[INDEX_FINGERTIP]?.y;
  if (!Number.isFinite(y)) return BASE_FREQUENCY;
  const octavesFromA4 = 1 - 2 * Math.min(1, Math.max(0, y)); // +1 at the top, -1 at the bottom
  return BASE_FREQUENCY * 2 ** octavesFromA4;
}

// Volume from distance to the camera: a closer hand looks bigger, so it plays louder.
// Hand size = wrist → middle-finger knuckle, in frame units; palm points don't move
// when the fingers do. Tune these by feel (the status line shows the live size).
const FAR = 0.12; // hand size at or below → silent
const NEAR = 0.35; // hand size at or above → full volume
const WRIST = 0;
const MIDDLE_KNUCKLE = 9;

export function handSize(hand) {
  const a = hand?.landmarks?.[WRIST];
  const b = hand?.landmarks?.[MIDDLE_KNUCKLE];
  if (!a || !b) return 0;
  return Math.hypot(a.x - b.x, a.y - b.y); // z is noisy; ignore it
}

export function handToVolume(hand) {
  const size = handSize(hand);
  if (!Number.isFinite(size)) return 0;
  return Math.min(1, Math.max(0, (size - FAR) / (NEAR - FAR)));
}

export function handToSound(hands) {
  if (hands.length === 0) return { volume: 0, frequency: BASE_FREQUENCY };
  const hand = hands[0];
  return { volume: handToVolume(hand), frequency: handToFrequency(hand) };
}
