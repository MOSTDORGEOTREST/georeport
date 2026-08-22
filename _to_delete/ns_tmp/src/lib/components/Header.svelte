<script>
  import { page } from '$app/stores';
  import { logged } from '$lib/stores.js';
  import { get as apiGet } from '$lib/api.js';

  let mobileOpen = $state(false);
  let isLogged = $state(false);
  let pathname = $state('/');
  let scrolled = $state(false);

  logged.subscribe(v => isLogged = v);
  page.subscribe(p => pathname = p.url?.pathname || '/');

  let isLoginPage = $derived(pathname.includes('/login'));

  // Блокируем прокрутку страницы, пока открыто мобильное меню
  $effect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  });

  $effect(() => {
    if (typeof window === 'undefined') return;
    const onScroll = () => scrolled = window.scrollY > 8;
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });

  function closeNav() {
    mobileOpen = false;
  }

  function toggleNav() {
    mobileOpen = !mobileOpen;
  }

  function overlayClick(e) {
    if (e.target === e.currentTarget) closeNav();
  }

  function onWindowKeydown(e) {
    if (e.key === 'Escape' && mobileOpen) closeNav();
  }

  function scrollTo(hash) {
    closeNav();
    if (hash === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.querySelector(hash);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  async function signOut() {
    try {
      await apiGet('/auth/sign-out/');
    } catch {}
    logged.set(false);
    closeNav();
    window.location.href = '/';
  }

  const mainLinks = [
    { href: '/', hash: '#', label: 'Главная', icon: 'ri-home-5-line' },
    { href: '/#about', hash: '#about', label: 'Описание проекта', icon: 'ri-file-shield-2-line' },
    { href: '/#license', hash: '#license', label: 'Покупка', icon: 'ri-key-2-line' },
    { href: '/#contact', hash: '#contact', label: 'Контакты', icon: 'ri-chat-3-line' }
  ];
</script>

<header class="header" class:header--scrolled={scrolled}>
  <nav class="header__nav">
    <a href="/" class="header__logo" aria-label="GEOREPORT — на главную" onclick={(e) => { if (pathname === '/') { e.preventDefault(); scrollTo('#'); } }}>
      <img src="/images/logo-2.png" alt="" class="header__logo-mark" />
      <span class="header__logo-copy">
        <strong>GEOREPORT</strong>
        <small>Защита протоколов</small>
      </span>
    </a>

    {#if !isLoginPage}
      <ul class="header__links">
        {#each mainLinks as link}
          <li>
            <a
              href={link.href}
              class="header__link"
              onclick={(e) => { if (pathname === '/') { e.preventDefault(); scrollTo(link.hash); } }}
            >{link.label}</a>
          </li>
        {/each}
        <li>
          <a href="/login" class="header__link header__link--cta">
            <i class="ri-user-3-line" aria-hidden="true"></i>
            Личный кабинет
          </a>
        </li>
      </ul>
    {:else}
      <ul class="header__links">
        <li><a href="/" class="header__link">Главная</a></li>
        {#if isLogged}
          <li>
            <button class="header__link header__link--cta" onclick={signOut}>
              <i class="ri-logout-box-r-line" aria-hidden="true"></i>
              Выйти
            </button>
          </li>
        {/if}
      </ul>
    {/if}

    <button
      class="header__toggle"
      onclick={toggleNav}
      aria-label="Открыть меню"
      aria-expanded={mobileOpen}
    >
      <i class="ri-menu-line" aria-hidden="true"></i>
    </button>
  </nav>
</header>

<svelte:window onkeydown={onWindowKeydown} />

<!-- Мобильное меню вынесено из <header>: backdrop-filter на шапке
     делает её containing block для position: fixed и обрезает панель -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="drawer"
  class:drawer--open={mobileOpen}
  onclick={overlayClick}
  aria-hidden={!mobileOpen}
>
  <aside class="drawer__panel">
    <div class="drawer__head">
      <div class="drawer__brand">
        <img src="/images/logo-2.png" alt="" class="drawer__logo" />
        <span>GEOREPORT</span>
      </div>
      <button class="drawer__close" onclick={closeNav} aria-label="Закрыть меню" tabindex={mobileOpen ? 0 : -1}>
        <i class="ri-close-line" aria-hidden="true"></i>
      </button>
    </div>

    <ul class="drawer__links">
      {#if !isLoginPage}
        {#each mainLinks as link}
          <li>
            <a
              href={link.href}
              class="drawer__link"
              tabindex={mobileOpen ? 0 : -1}
              onclick={(e) => { if (pathname === '/') { e.preventDefault(); scrollTo(link.hash); } else { closeNav(); } }}
            >
              <i class={link.icon} aria-hidden="true"></i>
              {link.label}
            </a>
          </li>
        {/each}
        <li class="drawer__divider" aria-hidden="true"></li>
        <li>
          <a href="/login" class="drawer__link drawer__link--cta" tabindex={mobileOpen ? 0 : -1} onclick={closeNav}>
            <i class="ri-user-3-line" aria-hidden="true"></i>
            Личный кабинет
          </a>
        </li>
      {:else}
        <li>
          <a href="/" class="drawer__link" tabindex={mobileOpen ? 0 : -1} onclick={closeNav}>
            <i class="ri-home-5-line" aria-hidden="true"></i>
            Главная
          </a>
        </li>
        {#if isLogged}
          <li class="drawer__divider" aria-hidden="true"></li>
          <li>
            <button class="drawer__link drawer__link--btn" tabindex={mobileOpen ? 0 : -1} onclick={signOut}>
              <i class="ri-logout-box-r-line" aria-hidden="true"></i>
              Выйти
            </button>
          </li>
        {/if}
      {/if}
    </ul>

    <div class="drawer__foot">
      <span>GEOREPORT · защита протоколов</span>
    </div>
  </aside>
</div>

<style>
  .header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 100;
    background: rgba(242, 236, 223, 0.75);
    border-bottom: 1px solid transparent;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    transition: box-shadow 0.4s ease, background 0.4s ease, border-color 0.4s ease;
  }

  .header--scrolled {
    background: rgba(242, 236, 223, 0.92);
    border-bottom-color: var(--line-soft);
    box-shadow: 0 10px 34px rgba(60, 42, 12, 0.08);
  }

  .header__nav {
    max-width: 1080px;
    margin: 0 auto;
    padding: 0 1.5rem;
    height: var(--header-height);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header__logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
  }

  .header__logo-mark {
    width: 42px;
    height: 42px;
    object-fit: contain;
    background: #F6F2E8;
    border: 1px solid var(--line-soft);
    border-radius: 12px;
    padding: 4px;
    box-shadow: 0 2px 8px rgba(60, 42, 12, 0.14);
  }

  .header__logo-copy {
    display: flex;
    flex-direction: column;
    line-height: 1.25;
  }

  .header__logo-copy strong {
    font-family: var(--font-d);
    color: var(--text-primary);
    font-size: 0.82rem;
    letter-spacing: 0.1em;
    font-weight: 600;
  }

  .header__logo-copy small {
    font-family: var(--font-m);
    color: var(--text-muted);
    font-size: 0.56rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-top: 0.25rem;
    white-space: nowrap;
  }

  .header__links {
    display: flex;
    gap: 0.35rem;
    list-style: none;
    padding: 0;
    margin: 0;
    align-items: center;
  }

  .header__link {
    color: var(--text-secondary);
    font-weight: 500;
    font-size: 0.85rem;
    text-decoration: none;
    transition: color 0.25s;
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    padding: 0.55rem 0.85rem;
    position: relative;
    border-radius: var(--radius-pill);
  }

  .header__link::after {
    content: '';
    position: absolute;
    left: 0.85rem;
    right: 0.85rem;
    bottom: 0.3rem;
    height: 1px;
    background: var(--accent);
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.35s var(--ease);
  }

  .header__link:hover {
    color: var(--text-primary);
  }

  .header__link:hover::after {
    transform: scaleX(1);
    transform-origin: left;
  }

  .header__link--cta {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: 0.6rem;
    padding: 0.6rem 1.2rem;
    border-radius: var(--radius-pill);
    background: var(--accent-gradient);
    color: #231604;
    font-weight: 700;
    box-shadow: 0 6px 20px rgba(166, 106, 20, 0.3);
    transition: transform 0.3s var(--ease), box-shadow 0.3s;
  }

  .header__link--cta::after {
    display: none;
  }

  .header__link--cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(166, 106, 20, 0.45);
    color: #231604;
  }

  .header__toggle {
    display: none;
    background: none;
    border: 1px solid var(--line);
    color: var(--text-primary);
    font-size: 1.5rem;
    cursor: pointer;
    width: 44px;
    height: 44px;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    -webkit-tap-highlight-color: transparent;
  }

  /* ── Мобильный drawer ───────────────────────────── */
  .drawer {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: var(--overlay);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
  }

  .drawer--open {
    opacity: 1;
    visibility: visible;
  }

  .drawer__panel {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    width: min(85%, 340px);
    display: flex;
    flex-direction: column;
    background: linear-gradient(160deg, #FBF8F1 0%, #F2ECDF 100%);
    border-left: 1px solid var(--line-soft);
    box-shadow: -16px 0 50px rgba(34, 26, 14, 0.28);
    transform: translateX(100%);
    transition: transform 0.32s var(--ease);
    padding: 1rem 1.25rem calc(1.25rem + var(--safe-bottom));
    overflow: hidden;
  }

  .drawer--open .drawer__panel {
    transform: translateX(0);
  }

  .drawer__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--glass-border);
  }

  .drawer__brand {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    color: var(--text-primary);
    font-family: var(--font-d);
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.08em;
  }

  .drawer__logo {
    width: 40px;
    height: 40px;
    object-fit: contain;
    background: #F6F2E8;
    border: 1px solid var(--line-soft);
    border-radius: 11px;
    padding: 4px;
  }

  .drawer__close {
    background: none;
    border: 1px solid var(--line);
    color: var(--text-primary);
    font-size: 1.4rem;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 13px;
    transition: var(--transition);
    -webkit-tap-highlight-color: transparent;
  }

  .drawer__close:active {
    background: var(--glass-bg-hover);
    transform: scale(0.95);
  }

  .drawer__links {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding-top: 1.25rem;
    flex: 1;
  }

  .drawer__link {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    width: 100%;
    padding: 0.85rem 0.9rem;
    min-height: 48px;
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    font-size: 1rem;
    font-weight: 600;
    background: none;
    border: none;
    font-family: inherit;
    text-align: left;
    cursor: pointer;
    transition: var(--transition);
    -webkit-tap-highlight-color: transparent;
  }

  .drawer__link i {
    font-size: 1.25rem;
    color: var(--accent);
    width: 1.5rem;
    text-align: center;
  }

  .drawer__link:hover,
  .drawer__link:active {
    background: rgba(232, 163, 61, 0.10);
    color: var(--accent-bright);
  }

  .drawer__link--cta {
    border: 1px solid rgba(166, 106, 20, 0.45);
    background: var(--accent-soft);
    color: var(--accent-bright);
  }

  .drawer__divider {
    height: 1px;
    background: var(--line-soft);
    margin: 0.75rem 0.25rem;
  }

  .drawer__foot {
    padding-top: 1rem;
    border-top: 1px dashed var(--line);
    font-family: var(--font-m);
    font-size: 0.62rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--text-muted);
    text-align: center;
  }

  /* планшет и уже: меню в drawer, чтобы ссылки не наезжали на логотип */
  @media screen and (max-width: 900px) {
    .header__links {
      display: none;
    }

    .header__toggle {
      display: flex;
    }
  }

  @media screen and (max-width: 768px) {
    .header__logo-copy small {
      display: none;
    }
  }

  @media screen and (min-width: 901px) {
    .drawer {
      display: none;
    }
  }
</style>
