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
    background: rgba(250, 252, 248, 0.84);
    border-bottom: 1px solid var(--glass-border);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    transition: box-shadow 0.3s ease, background 0.3s ease;
  }

  .header--scrolled {
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 10px 34px rgba(39, 57, 42, 0.1);
  }

  .header__nav {
    max-width: 1000px;
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
    gap: 0.7rem;
    text-decoration: none;
  }

  .header__logo-mark {
    width: 44px;
    height: 44px;
    object-fit: contain;
    filter: drop-shadow(0 5px 9px rgba(43, 63, 36, 0.18));
  }

  .header__logo-copy {
    display: flex;
    flex-direction: column;
    line-height: 1;
  }

  .header__logo-copy strong {
    color: var(--text-primary);
    font-size: 1rem;
    letter-spacing: 0.08em;
    font-weight: 800;
  }

  .header__logo-copy small {
    color: var(--text-muted);
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-top: 0.3rem;
  }

  .header__links {
    display: flex;
    gap: 1.75rem;
    list-style: none;
    padding: 0;
    margin: 0;
    align-items: center;
  }

  .header__link {
    color: var(--text-secondary);
    font-weight: 600;
    font-size: 0.9rem;
    text-decoration: none;
    transition: var(--transition);
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    padding: 0.25rem 0;
    position: relative;
  }

  .header__link::after {
    content: '';
    position: absolute;
    left: 0;
    right: 100%;
    bottom: -2px;
    height: 2px;
    border-radius: 2px;
    background: var(--accent-gradient);
    transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .header__link:hover {
    color: var(--text-primary);
  }

  .header__link:hover::after {
    right: 0;
  }

  .header__link--cta {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.5rem 1.1rem;
    border-radius: 999px;
    border: 1px solid rgba(143, 168, 84, 0.45);
    background: var(--accent-soft);
    color: var(--accent-bright);
  }

  .header__link--cta::after {
    display: none;
  }

  .header__link--cta:hover {
    background: var(--accent);
    border-color: var(--accent-light);
    color: #fff;
  }

  .header__toggle {
    display: none;
    background: none;
    border: none;
    color: var(--text-primary);
    font-size: 1.6rem;
    cursor: pointer;
    width: 44px;
    height: 44px;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    -webkit-tap-highlight-color: transparent;
  }

  /* ── Мобильный drawer ───────────────────────────── */
  .drawer {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: var(--overlay);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
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
    background: linear-gradient(160deg, #ffffff 0%, #f1f5ed 100%);
    border-left: 1px solid var(--glass-border);
    box-shadow: -16px 0 50px rgba(32, 48, 36, 0.22);
    transform: translateX(100%);
    transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 1rem 1.25rem calc(1.25rem + var(--safe-bottom));
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
    font-size: 0.9rem;
    font-weight: 800;
    letter-spacing: 0.08em;
  }

  .drawer__logo {
    width: 42px;
    height: 42px;
    object-fit: contain;
  }

  .drawer__close {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    color: var(--text-primary);
    font-size: 1.4rem;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
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
    color: var(--accent-light);
    width: 1.5rem;
    text-align: center;
  }

  .drawer__link:hover,
  .drawer__link:active {
    background: var(--glass-bg-hover);
    color: var(--accent);
  }

  .drawer__link--cta {
    border: 1px solid rgba(143, 168, 84, 0.45);
    background: var(--accent-soft);
    color: var(--accent-bright);
  }

  .drawer__divider {
    height: 1px;
    background: var(--glass-border);
    margin: 0.75rem 0.25rem;
  }

  .drawer__foot {
    padding-top: 1rem;
    border-top: 1px solid var(--glass-border);
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
    text-align: center;
  }

  @media screen and (max-width: 768px) {
    .header__logo-copy small {
      display: none;
    }

    .header__links {
      display: none;
    }

    .header__toggle {
      display: flex;
    }
  }

  @media screen and (min-width: 769px) {
    .drawer {
      display: none;
    }
  }
</style>
