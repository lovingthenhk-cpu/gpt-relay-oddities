'use strict';
(function () {
  const $ = id => document.getElementById(id);
  const form = $('wave-form');
  const animationButton = $('animate');
  const names = {sine:'正弦波',triangle:'三角波',square:'矩形波'};
  let frame = null;
  let moving = false;
  let phaseOffset = 0;
  let lastTime = null;

  function draw() {
    const shape = $('shape').value;
    const cycles = Number($('cycles').value);
    const amplitude = Number($('amplitude').value) / 100;
    const phaseDegrees = Number($('phase').value);
    const displayPhase = ((phaseDegrees + phaseOffset + 180) % 360 + 360) % 360 - 180;
    const samples = ODDWave.sampleWave(shape, cycles, amplitude, displayPhase);
    $('signal').setAttribute('points', ODDWave.toSvgPoints(samples));
    $('cycles-value').textContent = String(cycles);
    $('amplitude-value').textContent = Math.round(amplitude * 100) + '%';
    $('phase-value').textContent = phaseDegrees + '°';
    $('wave-readout').textContent = names[shape] + ' · ' + cycles + '周期 · 振幅' + Math.round(amplitude*100) + '% · 位相' + Math.round(displayPhase) + '°（音声出力なし）';
  }

  function stop() {
    moving = false;
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    lastTime = null;
    animationButton.setAttribute('aria-pressed','false');
    animationButton.textContent = '位相を動かす ▶';
  }
  function tick(timestamp) {
    if (!moving) return;
    if (lastTime !== null) {
      const elapsed = Math.min(0.1, Math.max(0, (timestamp - lastTime) / 1000));
      phaseOffset = (phaseOffset + elapsed * 90) % 360;
    }
    lastTime = timestamp;
    draw();
    frame = requestAnimationFrame(tick);
  }
  animationButton.addEventListener('click', function () {
    if (moving) {
      stop();
      return;
    }
    moving = true;
    animationButton.setAttribute('aria-pressed','true');
    animationButton.textContent = '位相を止める ■';
    lastTime = null;
    frame = requestAnimationFrame(tick);
  });
  form.addEventListener('input', draw);
  form.addEventListener('change', draw);
  form.addEventListener('reset', function () {
    stop();
    phaseOffset = 0;
    // Native form reset applies control defaults at the end of this event.
    queueMicrotask(draw);
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && moving) stop();
  });
  draw();
})();
