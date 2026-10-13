import { test } from "node:test";
import assert from "node:assert/strict";
import { handSize, handToFrequency, handToSound, handToVolume } from "../src/control.js";

const fakeHand = {
  landmarks: Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5, z: 0 })),
  handedness: "Right",
};

// Hand whose wrist→middle-knuckle length (its apparent size) is `size` of the frame.
function handOfSize(size) {
  const landmarks = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  landmarks[0] = { x: 0.5, y: 0.5 + size, z: 0 }; // wrist
  landmarks[9] = { x: 0.5, y: 0.5, z: 0 }; // middle-finger knuckle
  return { landmarks, handedness: "Right" };
}

test("no hand → silent", () => {
  assert.deepEqual(handToSound([]), { volume: 0, frequency: 440 });
});

test("one hand → A4", () => {
  assert.equal(handToSound([fakeHand]).frequency, 440);
});

// F5 — volume from distance to the camera (handToVolume): closer = bigger = louder

test("volume: hand size is wrist → middle-knuckle length", () => {
  assertCloseTo(handSize(handOfSize(0.25)), 0.25);
});

test("volume: far hand (small) → 0", () => {
  assert.equal(handToVolume(handOfSize(0.05)), 0);
});

test("volume: close hand (big) → 1", () => {
  assert.equal(handToVolume(handOfSize(0.6)), 1);
});

test("volume: halfway between FAR and NEAR → 0.5", () => {
  assertCloseTo(handToVolume(handOfSize((0.12 + 0.35) / 2)), 0.5);
});

test("volume: rises as the hand comes closer", () => {
  assert.ok(handToVolume(handOfSize(0.3)) > handToVolume(handOfSize(0.2)));
});

test("volume: malformed hand → 0, never NaN", () => {
  for (const hand of [undefined, null, {}, { landmarks: [] }]) {
    assert.equal(handToVolume(hand), 0);
  }
});

// F4 — pitch from height (handToFrequency)

// Every landmark at restY, except the index fingertip (landmark 8) at tipY.
function handWithFingertipAt(tipY, restY = 0.5) {
  const landmarks = Array.from({ length: 21 }, () => ({ x: 0.5, y: restY, z: 0 }));
  landmarks[8] = { x: 0.5, y: tipY, z: 0 };
  return { landmarks, handedness: "Right" };
}

function assertCloseTo(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-9, `expected ${actual} ≈ ${expected}`);
}

test("pitch: fingertip at the top of the frame (y = 0) → 880 Hz", () => {
  assert.equal(handToFrequency(handWithFingertipAt(0)), 880);
});

test("pitch: fingertip mid-frame (y = 0.5) → 440 Hz", () => {
  assert.equal(handToFrequency(handWithFingertipAt(0.5)), 440);
});

test("pitch: fingertip at the bottom of the frame (y = 1) → 220 Hz", () => {
  assert.equal(handToFrequency(handWithFingertipAt(1)), 220);
});

test("pitch: a quarter of the frame is half an octave (exponential, not linear)", () => {
  assertCloseTo(handToFrequency(handWithFingertipAt(0.25)), 440 * Math.SQRT2);
  assertCloseTo(handToFrequency(handWithFingertipAt(0.75)), 220 * Math.SQRT2);
});

test("pitch: strictly rises as the fingertip rises", () => {
  for (let i = 1; i <= 100; i++) {
    const below = handToFrequency(handWithFingertipAt(i / 100));
    const above = handToFrequency(handWithFingertipAt((i - 1) / 100));
    assert.ok(above > below, `y=${(i - 1) / 100} → ${above} Hz, y=${i / 100} → ${below} Hz`);
  }
});

test("pitch: fingertip above the frame (y < 0) clamps to 880 Hz", () => {
  assert.equal(handToFrequency(handWithFingertipAt(-0.2)), 880);
  assert.equal(handToFrequency(handWithFingertipAt(-5)), 880);
});

test("pitch: fingertip below the frame (y > 1) clamps to 220 Hz", () => {
  assert.equal(handToFrequency(handWithFingertipAt(1.3)), 220);
  assert.equal(handToFrequency(handWithFingertipAt(9)), 220);
});

test("pitch: follows the index fingertip (landmark 8), not the rest of the hand", () => {
  assert.equal(handToFrequency(handWithFingertipAt(1, 0)), 220);
  assert.equal(handToFrequency(handWithFingertipAt(0, 1)), 880);
});

test("pitch: handToSound plays the fingertip's pitch", () => {
  assert.equal(handToSound([handWithFingertipAt(0)]).frequency, 880);
});

// The rest of each hand sits near the top, so falling back to another landmark can't yield 440.
function withFingertip(fingertip) {
  const hand = handWithFingertipAt(0.1, 0.1);
  hand.landmarks[8] = fingertip;
  return hand;
}

const MALFORMED_HANDS = [
  ["no hand", undefined],
  ["null hand", null],
  ["hand without landmarks", { handedness: "Right" }],
  ["landmarks null", { landmarks: null }],
  ["landmarks empty", { landmarks: [] }],
  ["only 8 landmarks", { landmarks: handWithFingertipAt(0.1, 0.1).landmarks.slice(0, 8) }],
  ["fingertip landmark null", withFingertip(null)],
  ["fingertip without y", withFingertip({ x: 0.5, z: 0 })],
  ["fingertip y NaN", handWithFingertipAt(NaN, 0.1)],
  ["fingertip y Infinity", handWithFingertipAt(Infinity, 0.1)],
  ["fingertip y -Infinity", handWithFingertipAt(-Infinity, 0.1)],
  ["fingertip y a string", handWithFingertipAt("0.2", 0.1)],
  ["fingertip y null", handWithFingertipAt(null, 0.1)],
];

for (const [label, hand] of MALFORMED_HANDS) {
  test(`pitch: ${label} → 440 Hz, never NaN`, () => {
    assert.equal(handToFrequency(hand), 440);
  });
}
