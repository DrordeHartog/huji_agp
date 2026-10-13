// Webcam via getUserMedia. Throws Errors with user-readable messages.

const MESSAGES = {
  NotAllowedError: "Camera permission was denied. Allow camera access in the address bar and press Start again.",
  NotFoundError: "No camera found. Plug one in and press Start again.",
  NotReadableError: "The camera is in use by another app. Close it and press Start again.",
  OverconstrainedError: "The camera doesn't support the requested resolution.",
};

export async function startCamera(videoEl) {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Camera not available. Open the page over HTTPS or http://localhost.");
  }
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: "user" },
      audio: false,
    });
  } catch (err) {
    throw new Error(MESSAGES[err.name] ?? `Could not start the camera (${err.name}).`);
  }
  videoEl.srcObject = stream;
  await videoEl.play();
}
