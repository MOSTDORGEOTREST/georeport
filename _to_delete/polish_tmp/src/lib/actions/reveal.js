/**
 * Svelte-action: плавное появление блока при попадании в вьюпорт.
 * Использование: <div use:reveal={{ delay: 120 }}>
 * Уважает prefers-reduced-motion — в этом случае блок виден сразу.
 */
let observer = null;

function getObserver() {
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  return observer;
}

export function reveal(node, { delay = 0 } = {}) {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced || typeof IntersectionObserver === 'undefined') {
    return {};
  }

  node.classList.add('reveal-hidden');
  if (delay) node.style.setProperty('--reveal-delay', `${delay}ms`);

  // Элемент уже во вьюпорте на момент монтирования — показываем сразу,
  // но с анимацией (без наблюдателя), чтобы не было «мигания».
  const rect = node.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom > 0) {
    requestAnimationFrame(() => node.classList.add('reveal-visible'));
    return {};
  }

  const obs = getObserver();
  obs.observe(node);

  return {
    destroy() {
      obs.unobserve(node);
    }
  };
}
