import { test } from "node:test";
import assert from "node:assert/strict";
import { handToSound } from "../src/control.js";

const fakeHand = {
  landmarks: Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5, z: 0 })),
  handedness: "Right",
};

test("no hand → silent", () => {
  assert.deepEqual(handToSound([]), { volume: 0, frequency: 440 });
});

test("one hand → fixed A4 at 0.3", () => {
  assert.deepEqual(handToSound([fakeHand]), { volume: 0.3, frequency: 440 });
});
