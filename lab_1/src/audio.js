// Web Audio engine: one sine oscillator → gain → speakers.
// The oscillator runs continuously; sound on/off is only ever a gain ramp, so there are no clicks.

const RAMP_SECONDS = 0.05; // a change reaches ~95% of its target in this time

export function createAudio() {
  let ctx = null;
  let oscillator = null;
  let gain = null;
  let volume = 0;
  let frequency = 440;

  function rampTo(param, value) {
    param.setTargetAtTime(value, ctx.currentTime, RAMP_SECONDS / 3);
  }

  return {
    async start() {
      if (!ctx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) throw new Error("This browser can't play sound (no Web Audio API).");
        ctx = new AudioContextClass();
        oscillator = ctx.createOscillator();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain = ctx.createGain();
        gain.gain.value = 0;
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start();
      }
      if (ctx.state !== "running") await ctx.resume();
      rampTo(gain.gain, volume);
    },

    setVolume(v) {
      if (!Number.isFinite(v)) return;
      const next = Math.min(1, Math.max(0, v));
      if (next === volume) return;
      volume = next;
      if (ctx) rampTo(gain.gain, volume);
    },

    setFrequency(hz) {
      if (!Number.isFinite(hz) || hz <= 0 || hz === frequency) return;
      frequency = hz;
      if (ctx) rampTo(oscillator.frequency, frequency);
    },
  };
}
