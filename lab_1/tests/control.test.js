import { test } from "node:test";
import assert from "node:assert/strict";
import { handToSound, handToVolume } from "../src/control.js";

const fakeHand = {
  landmarks: Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5, z: 0 })),
  handedness: "Right",
};

// Hand of the given size (wrist→middle knuckle) whose thumb and index tips are
// `pinch` hand-sizes apart.
function handWithPinch(pinch, size = 0.2) {
  const landmarks = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  landmarks[0] = { x: 0.5, y: 0.5 + size, z: 0 }; // wrist
  landmarks[9] = { x: 0.5, y: 0.5, z: 0 }; // middle-finger knuckle
  landmarks[4] = { x: 0.4, y: 0.4, z: 0 }; // thumb tip
  landmarks[8] = { x: 0.4 + pinch * size, y: 0.4, z: 0 }; // index tip
  return { landmarks, handedness: "Right" };
}

test("no hand → silent", () => {
  assert.deepEqual(handToSound([]), { volume: 0, frequency: 440 });
});

test("one hand → A4", () => {
  assert.equal(handToSound([fakeHand]).frequency, 440);
});

test("pinched hand → volume 0", () => {
  assert.equal(handToVolume(handWithPinch(0.1)), 0);
});

test("open hand → volume 1", () => {
  assert.equal(handToVolume(handWithPinch(1.5)), 1);
});

test("half-open pinch → volume 0.5", () => {
  assert.ok(Math.abs(handToVolume(handWithPinch(0.6)) - 0.5) < 1e-9);
});

test("same pinch closer to the camera → same volume", () => {
  const far = handToVolume(handWithPinch(0.5, 0.1));
  const near = handToVolume(handWithPinch(0.5, 0.3));
  assert.ok(Math.abs(far - near) < 1e-9);
});

test("zero-size hand → volume 0, not NaN", () => {
  assert.equal(handToVolume(fakeHand), 0);
});
