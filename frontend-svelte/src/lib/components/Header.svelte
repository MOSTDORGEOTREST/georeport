<script>
  import { page } from '$app/stores';
  import { logged } from '$lib/stores.js';
  import { get as apiGet } from '$lib/api.js';

  let mobileOpen = $state(false);
  let isLogged = $state(false);
  let pathname = $state('/');

  logged.subscribe(v => isLogged = v);
  page.subscribe(p => pathname = p.url?.pathname || '/');

  let isLoginPage = $derived(pathname.includes('/login'));

  function closeNav() {
    mobileOpen = false;
  }

  function toggleNav() {
    mobileOpen = !mobileOpen;
  }

  function wrapperClick(e) {
    if (e.target === e.currentTarget) closeNav();
  }

  function scrollTo(hash) {
    closeNav();
    if (hash === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setTimeout(() => {
      const el = document.querySelector(hash);
      if (el) {
        const top = el.offsetTop - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }, 100);
  }

  async function signOut() {
    try {
      await apiGet('/auth/sign-out/');
    } catch {}
    logged.set(false);
    closeNav();
    window.location.href = '/';
  }
</script>

<header class="header glass">
  <nav class="header__nav">
    <a href="/" class="header__logo" onclick={() => scrollTo('#')}>
      <img src="/images/logo.png" alt="GEOREPORT" class="header__logo-img" />
    </a>

    {#if !isLoginPage}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="header__overlay"
        class:header__overlay--open={mobileOpen}
        onclick={wrapperClick}
      >
        <div class="header__menu" class:header__menu--open={mobileOpen}>
          <ul class="header__links">
            <li><a href="/" class="header__link" onclick={() => scrollTo('#')}>Главная</a></li>
            <li><a href="/#about" class="header__link" onclick={() => scrollTo('#about')}>Описание проекта</a></li>
            <li><a href="/#license" class="header__link" onclick={() => scrollTo('#license')}>Покупка</a></li>
            <li><a href="/#contact" class="header__link" onclick={() => scrollTo('#contact')}>Контакты</a></li>
            <li><a href="/login" class="header__link" onclick={closeNav}>Личный кабинет</a></li>
          </ul>
          <button class="header__close" onclick={closeNav}>
            <i class="ri-close-line"></i>
          </button>
        </div>
      </div>
    {:else}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="header__overlay"
        class:header__overlay--open={mobileOpen}
        onclick={wrapperClick}
      >
        <div class="header__menu" class:header__menu--open={mobileOpen}>
          <ul class="header__links">
            <li><a href="/" class="header__link" onclick={closeNav}>Главная</a></li>
            {#if isLogged}
              <li><button class="header__link header__link--btn" onclick={signOut}>Выйти</button></li>
            {/if}
          </ul>
          <button class="header__close" onclick={closeNav}>
            <i class="ri-close-line"></i>
          </button>
        </div>
      </div>
    {/if}

    <button class="header__toggle" onclick={toggleNav}>
      <i class="ri-menu-line"></i>
    </button>
  </nav>
</header>

<style>
  .header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 100;
    background: rgba(10, 31, 10, 0.7);
    border-bottom: 1px solid var(--glass-border);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-radius: 0;
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
    text-decoration: none;
  }

  .header__logo-img {
    height: 50px;
    width: auto;
  }

  .header__links {
    display: flex;
    gap: 2rem;
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
    padding: 0;
  }

  .header__link:hover {
    color: var(--accent-light);
  }

  .header__link--btn {
    color: var(--text-secondary);
  }

  .header__toggle,
  .header__close {
    display: none;
    background: none;
    border: none;
    color: var(--text-primary);
    font-size: 1.5rem;
    cursor: pointer;
  }

  .header__overlay {
    display: contents;
  }

  @media screen and (max-width: 768px) {
    .header__toggle {
      display: flex;
    }

    .header__overlay {
      display: block;
      position: fixed;
      top: 0;
      right: -100%;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 99;
      transition: right 0.3s ease;
    }

    .header__overlay--open {
      right: 0;
    }

    .header__menu {
      position: absolute;
      right: -100%;
      top: 0;
      width: 60%;
      max-width: 300px;
      height: 100%;
      background: rgba(10, 31, 10, 0.95);
      backdrop-filter: blur(30px);
      -webkit-backdrop-filter: blur(30px);
      padding: 4rem 2rem 2rem;
      transition: right 0.3s ease;
      border-left: 1px solid var(--glass-border);
    }

    .header__menu--open {
      right: 0;
    }

    .header__links {
      flex-direction: column;
      gap: 1.5rem;
      align-items: flex-start;
    }

    .header__close {
      display: flex;
      position: absolute;
      top: 1rem;
      right: 1rem;
      font-size: 1.5rem;
    }
  }
</style>
