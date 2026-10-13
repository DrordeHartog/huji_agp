// Hand tracking: MediaPipe HandLandmarker (VIDEO mode, one hand), loaded from jsDelivr at a pinned version.
// Loaded with a dynamic import so a CDN failure becomes a readable error instead of a dead page.

const VERSION = "0.10.35";
const CDN = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}`;
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

export async function createHandTracker() {
  let landmarker;
  try {
    const { FilesetResolver, HandLandmarker } = await import(`${CDN}/vision_bundle.mjs`);
    const vision = await FilesetResolver.forVisionTasks(`${CDN}/wasm`);
    const options = (delegate) => ({
      baseOptions: { modelAssetPath: MODEL_URL, delegate },
      runningMode: "VIDEO",
      numHands: 1,
    });
    try {
      landmarker = await HandLandmarker.createFromOptions(vision, options("GPU"));
    } catch {
      landmarker = await HandLandmarker.createFromOptions(vision, options("CPU"));
    }
  } catch (err) {
    throw new Error(`Hand tracking failed to load (${err.message}). Check your connection and press Start again.`);
  }

  let lastVideoTime = -1;
  let lastTimestamp = -Infinity;
  let hands = [];

  return {
    detect(videoEl, timestampMs) {
      // Run the model only on a new video frame, with strictly increasing timestamps (MediaPipe requires it).
      if (videoEl.readyState < 2 || videoEl.currentTime === lastVideoTime || timestampMs <= lastTimestamp) {
        return hands;
      }
      lastVideoTime = videoEl.currentTime;
      lastTimestamp = timestampMs;
      const result = landmarker.detectForVideo(videoEl, timestampMs);
      hands = result.landmarks.map((landmarks, i) => ({
        landmarks: landmarks.map(({ x, y, z }) => ({ x, y, z })),
        handedness: result.handedness[i]?.[0]?.categoryName ?? "Right",
      }));
      return hands;
    },
  };
}
