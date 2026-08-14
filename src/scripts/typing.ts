function initTyping(el: HTMLElement) {
  const text = el.dataset.text ?? el.textContent ?? '';
  el.textContent = '';
  el.classList.add('typing');

  const cursor = document.createElement('span');
  cursor.className = 'typing__cursor';
  cursor.textContent = '_';
  el.appendChild(cursor);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    cursor.remove();
    el.textContent = text;
    return;
  }

  let i = 0;
  function tick() {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      el.appendChild(cursor);
      i++;
      setTimeout(tick, 28);
    }
  }
  tick();
}

document.querySelectorAll<HTMLElement>('[data-typing]').forEach(initTyping);
