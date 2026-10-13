// Draws the mirrored camera feed (and, from F2 hand tracking, landmarks) on the canvas.

export function drawFrame(ctx, videoEl, hands) {
  const { width, height } = ctx.canvas;
  if (videoEl.readyState < 2) {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#888";
    ctx.font = "20px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("waiting for camera…", width / 2, height / 2);
    return;
  }
  ctx.save();
  ctx.translate(width, 0);
  ctx.scale(-1, 1); // mirror, like a selfie view
  ctx.drawImage(videoEl, 0, 0, width, height);
  ctx.restore();
}
