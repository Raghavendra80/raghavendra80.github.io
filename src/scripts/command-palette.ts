interface Route {
  label: string;
  href: string;
  hint?: string;
}

const routes: Route[] = [
  { label: 'Home', href: '/', hint: 'about' },
  { label: 'Publications', href: '/publications/' },
  { label: 'Whitepapers', href: '/whitepapers/' },
  { label: 'Patents', href: '/patents/' },
  { label: 'Blogs', href: '/blog/' },
  { label: 'Talks & Videos', href: '/talks/' },
  { label: 'Before Supra', href: '/cv/' },
];

function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (!q) return 1;
  if (t.includes(q)) return 2;
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length ? 1 : 0;
}

function setup() {
  const overlay = document.getElementById('cmdk-overlay');
  const input = document.getElementById('cmdk-input') as HTMLInputElement | null;
  const list = document.getElementById('cmdk-list');
  const trigger = document.getElementById('cmdk-trigger');
  if (!overlay || !input || !list) return;

  let activeIndex = 0;
  let filtered = routes;

  function render() {
    list!.innerHTML = '';
    filtered.forEach((route, idx) => {
      const li = document.createElement('li');
      li.className = 'cmdk__item' + (idx === activeIndex ? ' is-active' : '');
      li.innerHTML = `<span>${route.label}</span>${route.hint ? `<span class="cmdk__hint">${route.hint}</span>` : ''}`;
      li.addEventListener('mouseenter', () => {
        activeIndex = idx;
        render();
      });
      li.addEventListener('click', () => go(route));
      list!.appendChild(li);
    });
  }

  function go(route: Route) {
    window.location.href = route.href;
  }

  function open() {
    overlay!.classList.add('is-open');
    input!.value = '';
    filtered = routes;
    activeIndex = 0;
    render();
    setTimeout(() => input!.focus(), 10);
  }

  function close() {
    overlay!.classList.remove('is-open');
  }

  trigger?.addEventListener('click', open);

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      overlay!.classList.contains('is-open') ? close() : open();
    }
    if (e.key === 'Escape') close();
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  input.addEventListener('input', () => {
    const q = input.value;
    filtered = routes
      .map((r) => ({ r, score: fuzzyScore(q, r.label) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.r);
    activeIndex = 0;
    render();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, filtered.length - 1);
      render();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      render();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const route = filtered[activeIndex];
      if (route) go(route);
    }
  });
}

setup();
