interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  flickerSpeed: number;
  flickerPhase: number;
  color: string;
  constellation: boolean;
}

interface Planet {
  orbitRadius: number;
  radius: number;
  angle: number;
  angularSpeed: number;
  color: string;
}

interface StarSystem {
  x: number;
  y: number;
  starRadius: number;
  starColor: string;
  squish: number;
  planets: Planet[];
}

interface BlackHole {
  x: number;
  y: number;
  radius: number;
  diskRadiusX: number;
  diskRadiusY: number;
  rotation: number;
}

interface Asteroid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  points: number[];
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  trailFactor: number;
  maxAlpha: number;
  lineWidth: number;
}

const STAR_COLORS = ['#e6edf3', '#9ec5fe', '#ffe9b3', '#c9d1d9'];

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function makeAsteroidPoints(sides: number) {
  const pts: number[] = [];
  for (let i = 0; i < sides; i++) pts.push(rand(0.65, 1));
  return pts;
}

function initSpaceHero(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let stars: Star[] = [];
  let systems: StarSystem[] = [];
  let blackHole: BlackHole;
  let asteroids: Asteroid[] = [];
  let meteors: Meteor[] = [];
  let meteorTimer = 0;
  let slowMeteorTimer = rand(180, 400);
  let time = 0;

  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  function resize() {
    const rect = canvas.parentElement!.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio, 2);
    width = canvas.width = rect.width * dpr;
    height = canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    mouse.x = mouse.targetX = width / 2;
    mouse.y = mouse.targetY = height / 2;

    const starCount = Math.min(220, Math.floor((rect.width * rect.height) / 4500));
    stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: rand(0.5, 1.8) * dpr,
      baseAlpha: rand(0.35, 1),
      flickerSpeed: rand(0.5, 2),
      flickerPhase: rand(0, Math.PI * 2),
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      constellation: Math.random() < 0.14,
    }));

    const systemCount = width > 700 * dpr ? 2 : 1;
    systems = Array.from({ length: systemCount }, (_, i) => {
      const sx = width * (0.2 + i * 0.5 + rand(-0.05, 0.05));
      const sy = height * rand(0.2, 0.55);
      const starColor = i % 2 === 0 ? '#ffb454' : '#ff8a65';
      const planetCount = Math.floor(rand(2, 4));
      return {
        x: sx,
        y: sy,
        starRadius: rand(6, 9) * dpr,
        starColor,
        squish: rand(0.35, 0.55),
        planets: Array.from({ length: planetCount }, (_, p) => ({
          orbitRadius: (28 + p * 22 + rand(-4, 4)) * dpr,
          radius: rand(1.6, 3.2) * dpr,
          angle: rand(0, Math.PI * 2),
          // ~5 minutes per revolution for the innermost planet, slower further out
          angularSpeed: (rand(0.00025, 0.00045) / (p + 1)) * (Math.random() < 0.5 ? 1 : -1),
          color: ['#8ecae6', '#c77dff', '#90e0c9', '#e9c46a'][p % 4],
        })),
      };
    });

    blackHole = {
      x: width * rand(0.78, 0.9),
      y: height * rand(0.65, 0.85),
      radius: 10 * dpr,
      diskRadiusX: 34 * dpr,
      diskRadiusY: 11 * dpr,
      rotation: rand(-0.3, 0.3),
    };

    const asteroidCount = Math.floor(rand(10, 16));
    const beltY = height * rand(0.55, 0.7);
    asteroids = Array.from({ length: asteroidCount }, () => ({
      x: Math.random() * width,
      y: beltY + rand(-40, 40) * dpr,
      vx: rand(-0.08, 0.08) * dpr,
      vy: rand(-0.02, 0.02) * dpr,
      size: rand(2, 5) * dpr,
      rotation: rand(0, Math.PI * 2),
      rotationSpeed: rand(-0.01, 0.01),
      points: makeAsteroidPoints(Math.floor(rand(5, 8))),
    }));

    meteors = [];
  }

  function spawnMeteor(kind: 'fast' | 'slow') {
    const fromTop = Math.random() < 0.6;
    const startX = fromTop ? rand(0, width) : (Math.random() < 0.5 ? -20 * dpr : width + 20 * dpr);
    const startY = fromTop ? -20 * dpr : rand(0, height * 0.5);
    const angle = rand(Math.PI * 0.15, Math.PI * 0.35) + (startX > width / 2 ? Math.PI * 0.5 : 0);

    if (kind === 'fast') {
      const speed = rand(6, 10) * dpr;
      meteors.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: rand(30, 50),
        trailFactor: 3,
        maxAlpha: 1,
        lineWidth: 1.5 * dpr,
      });
    } else {
      // slow meteor: gentle, long arc across the sky, easy to miss
      const speed = rand(0.35, 0.8) * dpr;
      meteors.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: rand(360, 600),
        trailFactor: 35,
        maxAlpha: 0.55,
        lineWidth: 1 * dpr,
      });
    }
  }

  function drawStars(dt: number) {
    for (const s of stars) {
      const flicker = 0.7 + 0.3 * Math.sin(time * s.flickerSpeed + s.flickerPhase);
      const px = s.x + (mouse.x - width / 2) * -0.015;
      const py = s.y + (mouse.y - height / 2) * -0.015;
      ctx!.globalAlpha = s.baseAlpha * flicker;
      ctx!.fillStyle = s.color;
      ctx!.beginPath();
      ctx!.arc(px, py, s.radius, 0, Math.PI * 2);
      ctx!.fill();
    }
    ctx!.globalAlpha = 1;

    // faint constellation lines between a subset of bright stars
    const bright = stars.filter((s) => s.constellation);
    ctx!.strokeStyle = 'rgba(230, 237, 243, 0.08)';
    ctx!.lineWidth = 1;
    for (let i = 0; i < bright.length; i++) {
      for (let j = i + 1; j < bright.length; j++) {
        const a = bright[i];
        const b = bright[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 160 * dpr) {
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(b.x, b.y);
          ctx!.stroke();
        }
      }
    }
  }

  function drawSystems(dt: number) {
    for (const sys of systems) {
      const px = sys.x + (mouse.x - width / 2) * -0.008;
      const py = sys.y + (mouse.y - height / 2) * -0.008;

      const glow = ctx!.createRadialGradient(px, py, 0, px, py, sys.starRadius * 4);
      glow.addColorStop(0, sys.starColor);
      glow.addColorStop(0.2, `${sys.starColor}88`);
      glow.addColorStop(1, 'transparent');
      ctx!.fillStyle = glow;
      ctx!.beginPath();
      ctx!.arc(px, py, sys.starRadius * 4, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.fillStyle = sys.starColor;
      ctx!.beginPath();
      ctx!.arc(px, py, sys.starRadius, 0, Math.PI * 2);
      ctx!.fill();

      for (const planet of sys.planets) {
        ctx!.strokeStyle = 'rgba(201, 209, 217, 0.12)';
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.ellipse(px, py, planet.orbitRadius, planet.orbitRadius * sys.squish, 0, 0, Math.PI * 2);
        ctx!.stroke();

        if (!prefersReducedMotion) planet.angle += planet.angularSpeed * dt;
        const plx = px + Math.cos(planet.angle) * planet.orbitRadius;
        const ply = py + Math.sin(planet.angle) * planet.orbitRadius * sys.squish;

        ctx!.fillStyle = planet.color;
        ctx!.beginPath();
        ctx!.arc(plx, ply, planet.radius, 0, Math.PI * 2);
        ctx!.fill();
      }
    }
  }

  function drawBlackHole(dt: number) {
    const bh = blackHole;
    const px = bh.x + (mouse.x - width / 2) * -0.004;
    const py = bh.y + (mouse.y - height / 2) * -0.004;
    if (!prefersReducedMotion) bh.rotation += 0.003 * dt;

    ctx!.save();
    ctx!.translate(px, py);
    ctx!.rotate(bh.rotation);

    const disk = ctx!.createRadialGradient(0, 0, bh.radius * 0.8, 0, 0, bh.diskRadiusX);
    disk.addColorStop(0, 'rgba(88, 166, 255, 0.9)');
    disk.addColorStop(0.5, 'rgba(57, 208, 216, 0.45)');
    disk.addColorStop(1, 'transparent');
    ctx!.fillStyle = disk;
    ctx!.beginPath();
    ctx!.ellipse(0, 0, bh.diskRadiusX, bh.diskRadiusY, 0, 0, Math.PI * 2);
    ctx!.fill();

    ctx!.restore();

    ctx!.fillStyle = '#010409';
    ctx!.beginPath();
    ctx!.arc(px, py, bh.radius, 0, Math.PI * 2);
    ctx!.fill();
  }

  function drawAsteroids(dt: number) {
    for (const a of asteroids) {
      if (!prefersReducedMotion) {
        a.x += a.vx * dt;
        a.y += a.vy * dt;
        a.rotation += a.rotationSpeed * dt;
        if (a.x < -10 * dpr) a.x = width + 10 * dpr;
        if (a.x > width + 10 * dpr) a.x = -10 * dpr;
      }

      ctx!.save();
      ctx!.translate(a.x, a.y);
      ctx!.rotate(a.rotation);
      ctx!.fillStyle = '#5c6773';
      ctx!.beginPath();
      const n = a.points.length;
      for (let i = 0; i < n; i++) {
        const ang = (i / n) * Math.PI * 2;
        const r = a.size * a.points[i];
        const x = Math.cos(ang) * r;
        const y = Math.sin(ang) * r;
        if (i === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      }
      ctx!.closePath();
      ctx!.fill();
      ctx!.restore();
    }
  }

  function drawMeteors(dt: number) {
    meteorTimer -= dt;
    if (meteorTimer <= 0 && !prefersReducedMotion) {
      spawnMeteor('fast');
      meteorTimer = rand(120, 260);
    }

    slowMeteorTimer -= dt;
    if (slowMeteorTimer <= 0 && !prefersReducedMotion) {
      spawnMeteor('slow');
      slowMeteorTimer = rand(600, 1200);
    }

    meteors = meteors.filter((m) => m.life < m.maxLife && m.x > -50 && m.x < width + 50 && m.y < height + 50);
    for (const m of meteors) {
      m.life += dt;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      const alpha = (1 - m.life / m.maxLife) * m.maxAlpha;
      const tailX = m.x - m.vx * m.trailFactor;
      const tailY = m.y - m.vy * m.trailFactor;
      const grad = ctx!.createLinearGradient(m.x, m.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      grad.addColorStop(1, 'transparent');
      ctx!.strokeStyle = grad;
      ctx!.lineWidth = m.lineWidth;
      ctx!.beginPath();
      ctx!.moveTo(m.x, m.y);
      ctx!.lineTo(tailX, tailY);
      ctx!.stroke();
    }
  }

  let lastTs = 0;
  function step(ts: number) {
    const dt = lastTs ? Math.min((ts - lastTs) / 16.67, 3) : 1;
    lastTs = ts;
    time += 0.016 * dt;

    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    ctx!.clearRect(0, 0, width, height);
    drawStars(dt);
    drawSystems(dt);
    drawBlackHole(dt);
    drawAsteroids(dt);
    drawMeteors(dt);

    if (!prefersReducedMotion) requestAnimationFrame(step);
  }

  resize();
  window.addEventListener('resize', resize);
  canvas.parentElement!.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.targetX = (e.clientX - rect.left) * dpr;
    mouse.targetY = (e.clientY - rect.top) * dpr;
  });

  requestAnimationFrame(step);
}

const canvas = document.getElementById('network-hero') as HTMLCanvasElement | null;
if (canvas) initSpaceHero(canvas);
