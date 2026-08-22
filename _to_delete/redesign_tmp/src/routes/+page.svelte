<script>
  import { onMount } from 'svelte';
  import InfoGraphic from '$lib/components/InfoGraphic.svelte';
  import { get as apiGet } from '$lib/api.js';

  let hovered = $state(false);
  let scrollProgress = $state(0);
  let touchMode = $state(false);
  let reportId = $state(null);
  const SCROLL_END = 400;

  onMount(() => {
    let cancelled = false;
    apiGet('/reports/sample_id/')
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.id) reportId = data.id;
      })
      .catch(() => {});

    let removeScrollListener = () => {};
    const isTouch = () => window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window;
    if (isTouch()) {
      touchMode = true;
      const el = document.querySelector('.home-img');
      if (el) {
        const update = () => {
          const y = window.scrollY;
          scrollProgress = Math.min(1, Math.max(0, y / SCROLL_END));
        };
        update();
        window.addEventListener('scroll', update, { passive: true });
        removeScrollListener = () => window.removeEventListener('scroll', update);
      }
    }

    return () => {
      cancelled = true;
      removeScrollListener();
    };
  });

  const features = [
    { icon: 'ri-shield-check-line', text: 'Защита от подделки' },
    { icon: 'ri-qr-scan-2-line', text: 'Проверка по QR-коду' },
    { icon: 'ri-braces-line', text: 'API для интеграции' }
  ];
</script>

<div class="home">
  <section class="hero fade-in">
    <div class="hero__row">
      <div class="hero__content">
        <span class="hero__badge">
          <i class="hero__live" aria-hidden="true"></i>
          Сервис аутентификации протоколов
        </span>

        <h1 class="hero__title">Проект <span class="hero__title-accent">GEOREPORT</span></h1>

        <p class="hero__lead">
          Добавляет протоколам лабораторных испытаний дополнительную
          степень защиты: данные регистрируются на сервере, а подлинность
          проверяется по QR-коду за пару секунд.
        </p>

        <div class="hero__actions">
          <a class="btn btn-accent hero__btn" href="/login">
            <i class="ri-user-3-line" aria-hidden="true"></i>
            Личный кабинет
          </a>
          <button class="btn btn-glass hero__btn hero__btn--ghost" onclick={() => {
            const el = document.querySelector('#about');
            if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
          }}>
            Как это работает
            <i class="ri-arrow-down-line" aria-hidden="true"></i>
          </button>
        </div>

        <ul class="hero__features">
          {#each features as f}
            <li class="hero__feature">
              <i class={f.icon} aria-hidden="true"></i>
              {f.text}
            </li>
          {/each}
        </ul>

        <p class="hero__trust">
          Разработано в АО «МОСТДОРГЕОТРЕСТ»
        </p>
      </div>

      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="home-img"
        class:home-img--hover={hovered}
        class:home-img--touch={touchMode}
        style="--scroll-progress: {scrollProgress}"
        onmouseenter={() => hovered = true}
        onmouseleave={() => hovered = false}
      >
        <img class="home-img__image" src="/images/mainimg.png" alt="Протокол испытаний с QR-кодом GEOREPORT" />
        <div class="home-img__overlay">
          {#if reportId}
            <a href="/report/{reportId}" class="home-img__qr-wrapper" aria-label="Открыть пример протокола">
              <img src="/images/qr_index.png" alt="QR" class="home-img__qr" />
              <span class="home-img__qr-hint">Пример протокола</span>
            </a>
          {:else}
            <div class="home-img__qr-wrapper home-img__qr-wrapper--placeholder">
              <img src="/images/qr_index.png" alt="QR" class="home-img__qr" />
            </div>
          {/if}
        </div>
      </div>
    </div>
  </section>

  <section class="section fade-in" id="about">
    <div class="section-head">
      <span class="section-kicker">Как это работает</span>
      <h2 class="section__title">Описание проекта</h2>
    </div>

    <div class="section__text glass">
      <p>
        GEOREPORT дублирует данные протоколов испытаний на защищённом
        сервере — после выдачи протокола изменить его результаты вне
        лаборатории невозможно.
      </p>
    </div>

    <InfoGraphic />
  </section>

  <section class="section fade-in" id="license">
    <div class="cta glass">
      <div class="cta__icon" aria-hidden="true">
        <i class="ri-flask-line"></i>
      </div>
      <h2 class="cta__title">Подключите свою лабораторию</h2>
      <p class="cta__text">
        Свяжитесь с нами — после подключения вам откроется личный кабинет,
        в котором вы сможете аутентифицировать протоколы своей лаборатории
        и управлять ими.
      </p>
      <a class="btn btn-accent cta__btn" href="mailto:tnick1502@mail.ru">
        <i class="ri-mail-send-line" aria-hidden="true"></i>
        Связаться
      </a>
    </div>
  </section>
</div>

<style>
  .home {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4rem;
    width: 100%;
    padding-top: 1rem;
  }

  /* ── HERO: тёмная «шахта» в стиле mdgt.ru ── */
  .hero {
    width: 100%;
  }

  .hero__row {
    position: relative;
    display: flex;
    align-items: center;
    gap: 3rem;
    background: linear-gradient(150deg, var(--dark) 0%, var(--dark-2) 100%);
    border-radius: var(--radius-lg);
    padding: clamp(1.75rem, 4vw, 3.25rem);
    box-shadow: 0 30px 70px rgba(17, 24, 38, 0.35);
    overflow: hidden;
  }

  /* зерно + янтарное свечение + стратиграфическая кромка */
  .hero__row::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.22;
    mix-blend-mode: overlay;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='s'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.55' numOctaves='2' seed='7' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23s)'/%3E%3C/svg%3E");
    background-size: 220px 220px;
  }

  .hero__row::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    width: 10px;
    background: var(--strata-v);
  }

  .hero__content {
    position: relative;
    z-index: 1;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1.35rem;
  }

  .hero__badge {
    display: inline-flex;
    align-items: center;
    gap: 0.7rem;
    font-family: var(--font-m);
    color: var(--amber);
    font-size: 0.66rem;
    font-weight: 500;
    letter-spacing: 0.38em;
    text-transform: uppercase;
  }

  .hero__live {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--green-live);
    box-shadow: 0 0 12px var(--green-live);
    animation: pulse 2s infinite;
    flex-shrink: 0;
  }

  .hero__title {
    font-family: var(--font-d);
    font-weight: 800;
    font-size: clamp(2.1rem, 5vw, 3.4rem);
    line-height: 1.05;
    color: var(--dark-ink);
  }

  .hero__title-accent {
    display: block;
    background: linear-gradient(135deg, var(--amber-hi) 0%, var(--amber) 60%, var(--amber-deep) 130%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero__lead {
    color: var(--dark-ink-dim);
    font-size: 1.02rem;
    font-weight: 300;
    line-height: 1.75;
    max-width: 30rem;
  }

  .hero__actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .hero__btn {
    text-decoration: none;
  }

  .hero__btn--ghost {
    color: var(--dark-ink);
    border-color: var(--dark-line);
  }

  .hero__btn--ghost:hover {
    color: var(--amber);
    border-color: var(--amber);
    background: rgba(232, 163, 61, 0.12);
  }

  .hero__features {
    display: flex;
    gap: 0.6rem;
    flex-wrap: wrap;
  }

  .hero__feature {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-m);
    color: var(--dark-ink-dim);
    font-size: 0.72rem;
    letter-spacing: 0.05em;
    padding: 0.5rem 0.95rem;
    border: 1px solid var(--dark-line);
    border-radius: var(--radius-pill);
    white-space: nowrap;
  }

  .hero__feature i {
    color: var(--amber);
    font-size: 1rem;
  }

  .hero__trust {
    font-family: var(--font-m);
    font-size: 0.62rem;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--dark-muted);
  }

  .home-img {
    position: relative;
    z-index: 1;
    display: inline-flex;
    flex-shrink: 0;
    border-radius: var(--radius-md);
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45), 0 0 0 1px var(--dark-line);
    margin-right: 10px;
  }

  .home-img::before {
    content: '';
    position: absolute;
    inset: -40%;
    z-index: -1;
    background: radial-gradient(circle at 50% 50%, rgba(232, 163, 61, 0.35), transparent 65%);
    opacity: 0.6;
  }

  .home-img__image {
    max-height: 420px;
    width: auto;
    border-radius: var(--radius-md);
    transition: transform 0.5s var(--ease);
  }

  .home-img--hover .home-img__image {
    transform: scale(1.02);
  }

  .home-img__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(10, 8, 4, 0);
    border-radius: var(--radius-md);
    transition: all 0.5s ease;
  }

  .home-img--hover .home-img__overlay {
    background: rgba(10, 8, 4, 0.5);
  }

  .home-img__qr-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    padding: 1rem;
    border-radius: var(--radius-md);
    background: rgba(255, 255, 255, 0);
    transition: all 0.5s ease;
    transform: scale(1);
    text-decoration: none;
  }

  .home-img--hover .home-img__qr-wrapper {
    background: rgba(255, 249, 235, 0.16);
    transform: scale(1.35);
  }

  .home-img__qr {
    width: 80px;
    height: auto;
    opacity: 0;
    transition: opacity 0.5s ease;
  }

  .home-img__qr-hint {
    font-family: var(--font-m);
    font-size: 0.56rem;
    font-weight: 500;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--amber-hi);
    opacity: 0;
    transition: opacity 0.5s ease;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
    white-space: nowrap;
  }

  .home-img--hover .home-img__qr,
  .home-img--hover .home-img__qr-hint {
    opacity: 1;
  }

  .home-img__qr-wrapper--placeholder {
    cursor: default;
    pointer-events: none;
  }

  /* ── Секции на «бумаге» ── */
  .section {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.75rem;
    scroll-margin-top: calc(var(--header-height) + 1rem);
  }

  .section__title {
    font-family: var(--font-d);
    font-weight: 600;
    font-size: clamp(1.4rem, 3vw, 1.9rem);
    text-align: center;
  }

  .section__text {
    padding: 1.4rem 1.6rem;
    color: var(--text-secondary);
    line-height: 1.75;
    width: 100%;
    border-left: 3px solid var(--amber);
  }

  .cta {
    position: relative;
    padding: 3rem 2rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 100%;
    overflow: hidden;
    border-radius: var(--radius-lg);
  }

  .cta::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 70% 90% at 50% -20%, rgba(232, 163, 61, 0.22), transparent 70%);
    pointer-events: none;
  }

  .cta::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 6px;
    background: var(--strata);
    opacity: 0.9;
  }

  .cta__icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--accent-soft);
    border: 1px solid rgba(166, 106, 20, 0.4);
    color: var(--accent);
    font-size: 1.8rem;
  }

  .cta__title {
    font-family: var(--font-d);
    font-weight: 600;
    font-size: clamp(1.25rem, 2.6vw, 1.6rem);
    color: var(--text-primary);
  }

  .cta__text {
    color: var(--text-secondary);
    max-width: 600px;
    line-height: 1.7;
  }

  .cta__btn {
    padding: 0.9rem 2.5rem;
    font-size: 1rem;
    text-decoration: none;
    animation: glow 3s ease-in-out infinite;
  }

  @media screen and (max-width: 900px) {
    .hero__row {
      flex-direction: column;
      align-items: center;
      gap: 2rem;
    }

    .hero__content {
      align-items: center;
      text-align: center;
    }

    .hero__actions {
      justify-content: center;
    }

    .hero__features {
      justify-content: center;
    }

    .home-img {
      max-width: 100%;
      margin-right: 0;
    }

    .hero__row::after {
      top: auto;
      left: 0;
      right: 0;
      bottom: 0;
      width: auto;
      height: 8px;
      background: var(--strata);
    }
  }

  @media screen and (max-width: 768px) {
    .home {
      gap: 3rem;
      padding-top: 0.25rem;
    }

    .hero__row {
      padding: 1.5rem 1.25rem 2rem;
    }

    .hero__lead {
      font-size: 0.95rem;
    }

    .hero__actions {
      width: 100%;
      flex-direction: column;
    }

    .hero__btn {
      width: 100%;
    }

    .hero__features {
      gap: 0.5rem;
    }

    .home-img__image {
      max-height: 320px;
    }

    .home-img--touch .home-img__image {
      transform: scale(calc(1 + 0.02 * var(--scroll-progress, 0)));
      transition: none;
    }

    .home-img--touch .home-img__overlay {
      background: rgba(10, 8, 4, calc(0.5 * var(--scroll-progress, 0)));
      transition: none;
    }

    .home-img--touch .home-img__qr-wrapper {
      background: rgba(255, 249, 235, calc(0.16 * var(--scroll-progress, 0)));
      transform: scale(calc(1 + 0.35 * var(--scroll-progress, 0)));
      transition: none;
    }

    .home-img--touch .home-img__qr,
    .home-img--touch .home-img__qr-hint {
      opacity: var(--scroll-progress, 0);
      transition: none;
    }

    .home-img--hover .home-img__qr-wrapper {
      transform: scale(1.2);
    }
  }
</style>
