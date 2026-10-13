// STUB — Partner B replaces this in F2: mirrored video + landmark dots.
export function drawFrame(ctx, videoEl, hands) {
  const { width, height } = ctx.canvas;
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#888";
  ctx.font = "20px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("camera coming soon", width / 2, height / 2);
}
