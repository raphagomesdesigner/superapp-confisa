(() => {
  const canvas = document.querySelector('[data-super-ai-canvas]');
  const hero = canvas?.closest('.super-hero-surface');
  const layer = canvas?.parentElement;
  if (!canvas || !hero || !layer) return;
  const context = canvas.getContext('2d');
  if (!context) return;

  const pointer = { x: null, y: null };
  let width = 0;
  let height = 0;
  let particles = [];
  let frame = 0;
  let lastTime = 0;
  let visible = true;
  let mobile = false;
  let connectionRadius = 170;
  let pointerRadius = 190;

  const clearPointer = () => { pointer.x = null; pointer.y = null; };
  const render = (step = 0) => {
    context.clearRect(0, 0, width, height);
    const interactive = pointer.x !== null;

    for (const particle of particles) {
      if (interactive && step) {
        const dx = pointer.x - particle.x;
        const dy = pointer.y - particle.y;
        const distance = Math.hypot(dx, dy);
        if (distance > .01 && distance < pointerRadius) {
          const push = (1 - distance / pointerRadius) * 2.4 * step;
          particle.x -= dx / distance * push;
          particle.y -= dy / distance * push;
        }
      }
      particle.x += particle.vx * step;
      particle.y += particle.vy * step;
      if (particle.x < 2 || particle.x > width - 2) particle.vx *= -1;
      if (particle.y < 2 || particle.y > height - 2) particle.vy *= -1;
      particle.x = Math.max(2, Math.min(width - 2, particle.x));
      particle.y = Math.max(2, Math.min(height - 2, particle.y));
    }

    for (let a = 0; a < particles.length; a++) {
      const first = particles[a];
      for (let b = a + 1; b < particles.length; b++) {
        const second = particles[b];
        const distance = Math.hypot(first.x - second.x, first.y - second.y);
        if (distance >= connectionRadius) continue;
        const nearPointer = interactive && Math.hypot(first.x - pointer.x, first.y - pointer.y) < pointerRadius;
        const alpha = (1 - distance / connectionRadius) * (nearPointer ? .65 : .3);
        const color = nearPointer ? '223,225,255' : first.warm && second.warm ? '244,144,153' : '157,158,244';
        context.strokeStyle = `rgba(${color},${alpha})`;
        context.lineWidth = nearPointer ? 1 : .8;
        context.beginPath();
        context.moveTo(first.x, first.y);
        context.lineTo(second.x, second.y);
        context.stroke();
      }
    }
    for (const particle of particles) {
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fillStyle = particle.warm ? 'rgba(255,164,164,.7)' : 'rgba(188,188,255,.76)';
      context.fill();
    }
  };

  const stop = () => { cancelAnimationFrame(frame); frame = 0; lastTime = 0; };
  const tick = now => {
    frame = 0;
    if (!visible || document.hidden) return;
    const interval = 1000 / (mobile ? 30 : 45);
    if (!lastTime || now - lastTime >= interval) {
      const elapsed = lastTime ? Math.min(now - lastTime, 64) : interval;
      render(elapsed / (1000 / 60));
      lastTime = now;
    }
    frame = requestAnimationFrame(tick);
  };
  const resume = () => {
    stop();
    if (visible && !document.hidden) frame = requestAnimationFrame(tick);
  };
  const resize = () => {
    const rect = layer.getBoundingClientRect();
    const nextWidth = Math.round(rect.width);
    const nextHeight = Math.round(rect.height);
    if (!nextWidth || !nextHeight || nextWidth === width && nextHeight === height) return;
    width = nextWidth;
    height = nextHeight;
    mobile = width <= 760;
    connectionRadius = mobile ? 160 : 175;
    pointerRadius = mobile ? 135 : 190;
    const density = mobile ? 14000 : 16000;
    const count = Math.max(22, Math.min(mobile ? 36 : 76, Math.round(width * height / density)));
    const ratio = Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    particles = Array.from({ length: count }, () => ({
      x: 2 + Math.random() * Math.max(1, width - 4),
      y: 2 + Math.random() * Math.max(1, height - 4),
      vx: (Math.random() < .5 ? -1 : 1) * (mobile ? .4 + Math.random() * .35 : .22 + Math.random() * .24),
      vy: (Math.random() < .5 ? -1 : 1) * (mobile ? .3 + Math.random() * .3 : .18 + Math.random() * .2),
      size: .9 + Math.random() * 1.5,
      warm: Math.random() < .18
    }));
    clearPointer();
    render();
    layer.classList.add('is-live');
    resume();
  };

  hero.addEventListener('pointermove', event => {
    const rect = layer.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
  }, { passive: true });
  hero.addEventListener('pointerdown', event => {
    const rect = layer.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
  }, { passive: true });
  hero.addEventListener('pointerleave', clearPointer, { passive: true });
  hero.addEventListener('pointercancel', clearPointer, { passive: true });
  hero.addEventListener('pointerup', event => { if (event.pointerType === 'touch') clearPointer(); }, { passive: true });
  document.addEventListener('visibilitychange', () => { clearPointer(); resume(); });
  const sizeObserver = new ResizeObserver(resize);
  sizeObserver.observe(layer);
  const visibilityObserver = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (!visible) clearPointer();
    resume();
  }, { threshold: 0 });
  visibilityObserver.observe(hero);
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', resume);
  resize();
})();
