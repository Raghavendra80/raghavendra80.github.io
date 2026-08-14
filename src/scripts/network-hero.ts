interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

function initNetworkHero(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = 0;
  let height = 0;
  let nodes: Node[] = [];
  const mouse = { x: -9999, y: -9999 };
  const LINK_DIST = 140;
  const MOUSE_RADIUS = 160;

  function resize() {
    const rect = canvas.parentElement!.getBoundingClientRect();
    width = canvas.width = rect.width * devicePixelRatio;
    height = canvas.height = rect.height * devicePixelRatio;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const count = Math.min(90, Math.floor((rect.width * rect.height) / 14000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3 * devicePixelRatio,
      vy: (Math.random() - 0.5) * 0.3 * devicePixelRatio,
    }));
  }

  function step() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;

      const dx = n.x - mouse.x * devicePixelRatio;
      const dy = n.y - mouse.y * devicePixelRatio;
      const dist = Math.hypot(dx, dy);
      if (dist < MOUSE_RADIUS * devicePixelRatio) {
        const force = (1 - dist / (MOUSE_RADIUS * devicePixelRatio)) * 0.6;
        n.x += (dx / (dist || 1)) * force;
        n.y += (dy / (dist || 1)) * force;
      }
    }

    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < LINK_DIST * devicePixelRatio) {
          const alpha = 1 - dist / (LINK_DIST * devicePixelRatio);
          ctx.strokeStyle = `rgba(88, 166, 255, ${alpha * 0.35})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const n of nodes) {
      ctx.fillStyle = 'rgba(88, 166, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.8 * devicePixelRatio, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!prefersReducedMotion) requestAnimationFrame(step);
  }

  resize();
  window.addEventListener('resize', resize);
  canvas.parentElement!.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.parentElement!.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  step();
}

const canvas = document.getElementById('network-hero') as HTMLCanvasElement | null;
if (canvas) initNetworkHero(canvas);
