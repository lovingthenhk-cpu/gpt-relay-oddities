'use strict';
/* A pure waveform engine: browser global + CommonJS for tests, no browser or audio dependencies. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ODDWave = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const TAU = Math.PI * 2;
  function waveValue(shape, angle) {
    if (shape === 'sine') return Math.sin(angle);
    if (shape === 'triangle') return (2 / Math.PI) * Math.asin(Math.sin(angle));
    if (shape === 'square') {
      // A consistent, right-continuous square wave with positive half-cycle first.
      const phase = ((angle % TAU) + TAU) % TAU;
      // Snap floating-point values at exact discontinuities consistently.
      if (phase < 1e-10 || TAU - phase < 1e-10) return 1;
      if (Math.abs(phase - Math.PI) < 1e-10) return -1;
      return phase < Math.PI ? 1 : -1;
    }
    throw new RangeError('Unknown waveform');
  }
  function sampleWave(shape, cycles, amplitude, phaseDegrees, count = 401) {
    if (!['sine', 'triangle', 'square'].includes(shape)) throw new RangeError('Invalid shape');
    if (!Number.isInteger(cycles) || cycles < 1 || cycles > 12) throw new RangeError('Invalid cycles');
    if (!Number.isFinite(amplitude) || amplitude < 0 || amplitude > 1) throw new RangeError('Invalid amplitude');
    if (!Number.isFinite(phaseDegrees) || Math.abs(phaseDegrees) > 180) throw new RangeError('Invalid phase');
    if (!Number.isInteger(count) || count < 2 || count > 2001) throw new RangeError('Invalid samples');
    const points = [];
    for (let i = 0; i < count; i++) {
      const x = i / (count - 1) * 800;
      const angle = i / (count - 1) * cycles * TAU + phaseDegrees * Math.PI / 180;
      const y = 150 - 120 * amplitude * waveValue(shape, angle);
      points.push({x, y});
    }
    return points;
  }
  function toSvgPoints(samples) {
    return samples.map(p => p.x.toFixed(2) + ',' + p.y.toFixed(2)).join(' ');
  }
  return Object.freeze({waveValue, sampleWave, toSvgPoints});
});
