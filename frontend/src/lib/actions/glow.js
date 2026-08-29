/**
 * Svelte-action: янтарное свечение, следующее за курсором (как у карточек
 * испытаний на mdgt.ru). Элементу ставится CSS-переменная --gx (в %),
 * а ::before карточки рисует radial-gradient в этой точке.
 * На touch-устройствах и при prefers-reduced-motion не активируется.
 */
export function glow(node) {
  if (typeof window === 'undefined') return {};
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const noHover = window.matchMedia('(hover: none)').matches;
  if (reduced || noHover) return {};

  const onMove = (e) => {
    const r = node.getBoundingClientRect();
    node.style.setProperty('--gx', `${((e.clientX - r.left) / r.width) * 100}%`);
  };

  node.addEventListener('mousemove', onMove, { passive: true });

  return {
    destroy() {
      node.removeEventListener('mousemove', onMove);
    }
  };
}
