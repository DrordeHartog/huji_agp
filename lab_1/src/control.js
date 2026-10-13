// Pure mapping from detected hands to sound parameters.
// F4 (Partner A) owns handToFrequency; F5 (Partner B) owns handToVolume.

const BASE_FREQUENCY = 440; // A4

export function handToFrequency(hand) {
  return BASE_FREQUENCY;
}

// Pinch = thumb-tip↔index-tip distance in hand sizes (wrist → middle knuckle),
// so moving closer to the camera doesn't change it. Tune these by feel.
const PINCHED = 0.2; // at or below → silent
const OPEN = 1.0; // at or above → full volume

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y); // z is noisy; ignore it
}

export function handToVolume(hand) {
  const lm = hand.landmarks;
  const handSize = distance(lm[0], lm[9]);
  if (handSize === 0) return 0;
  const pinch = distance(lm[4], lm[8]) / handSize;
  return Math.min(1, Math.max(0, (pinch - PINCHED) / (OPEN - PINCHED)));
}

export function handToSound(hands) {
  if (hands.length === 0) return { volume: 0, frequency: BASE_FREQUENCY };
  const hand = hands[0];
  return { volume: handToVolume(hand), frequency: handToFrequency(hand) };
}
