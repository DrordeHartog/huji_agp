// Pure mapping from detected hands to sound parameters.
// F4 (Partner A) owns handToFrequency; F5 (Partner B) owns handToVolume.

const BASE_FREQUENCY = 440; // A4

export function handToFrequency(hand) {
  return BASE_FREQUENCY;
}

export function handToVolume(hand) {
  return 0.3;
}

export function handToSound(hands) {
  if (hands.length === 0) return { volume: 0, frequency: BASE_FREQUENCY };
  const hand = hands[0];
  return { volume: handToVolume(hand), frequency: handToFrequency(hand) };
}
