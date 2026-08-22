<script>
  import { onMount } from 'svelte';
  import InfoGraphic from '$lib/components/InfoGraphic.svelte';
  import { get as apiGet } from '$lib/api.js';
  import { reveal } from '$lib/actions/reveal.js';

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

  const stripWords = ['Подлинность', 'Защита данных', 'QR-верификация', 'Открытый API'];

  // Лёгкий параллакс-наклон макета протокола (только desktop с курсором)
  let tiltX = $state(0);
  let tiltY = $state(0);

  function handleTilt(e) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    tiltY = px * 7;
    tiltX = -py * 5;
  }

  function resetTilt() {
    tiltX = 0;
    tiltY = 0;
    hovered = false;
  }
</script>

<div class="home">
  <section class="hero">
    <div class="hero__row">
      <div class="hero__content">
        <span class="hero__badge stagger-in" style="--stagger: 60ms">
          <i class="hero__live" aria-hidden="true"></i>
          <span class="hero__badge-text">Сервис аутентификации протоколов</span>
        </span>

        <h1 class="hero__title stagger-in" style="--stagger: 140ms">Проект <span class="hero__title-accent">GEOREPORT</span></h1>

        <p class="hero__lead stagger-in" style="--stagger: 240ms">
          Каждый протокол лабораторных испытаний получает цифровой дубликат
          на защищённом сервере — подлинность данных проверяется
          сканированием QR-кода за пару секунд.
        </p>

        <div class="hero__actions stagger-in" style="--stagger: 340ms">
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

        <ul class="hero__features stagger-in" style="--stagger: 440ms">
          {#each features as f}
            <li class="hero__feature">
              <i class={f.icon} aria-hidden="true"></i>
              {f.text}
            </li>
          {/each}
        </ul>

        <p class="hero__trust stagger-in" style="--stagger: 540ms">
          Разработано в АО «МОСТДОРГЕОТРЕСТ»
        </p>
      </div>

      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="home-img stagger-in"
        class:home-img--hover={hovered}
        class:home-img--touch={touchMode}
        style="--stagger: 300ms; --scroll-progress: {scrollProgress}; --rx: {tiltX}deg; --ry: {tiltY}deg"
        onmouseenter={() => hovered = true}
        onmousemove={handleTilt}
        onmouseleave={resetTilt}
      >
        <img class="home-img__image" src="/images/mainimg.png" alt="Протокол испытаний с QR-кодом GEOREPORT" />
        <div class="home-img__scan" aria-hidden="true"></div>
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

  <section class="section" id="about">
    <div class="section-head" use:reveal>
      <span class="section-kicker">Как это работает</span>
      <h2 class="section__title">Описание проекта</h2>
    </div>

    <div class="section__text glass" use:reveal={{ delay: 80 }}>
      <p>
        GEOREPORT дублирует данные протоколов испытаний на защищённом
        сервере — после выдачи протокола изменить его результаты вне
        лаборатории невозможно.
      </p>
    </div>

    <InfoGraphic />
  </section>

  <!-- фирменная бегущая строка, как на mdgt.ru -->
  <div class="strip" aria-hidden="true" use:reveal>
    <div class="strip__track">
      {#each [0, 1] as half (half)}
        <div class="strip__half">
          {#each stripWords as w, i}
            <span class="strip__item" class:strip__item--fill={i % 2 === 1}>{w}</span>
            <span class="strip__sep">·</span>
          {/each}
        </div>
      {/each}
    </div>
  </div>

  <section class="section" id="license">
    <div class="cta glass" use:reveal>
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

  /* мягкое янтарное свечение в углу, вместо цветной кромки */
  .hero__row::after {
    content: '';
    position: absolute;
    right: -22%;
    top: -32%;
    width: 60%;
    aspect-ratio: 1;
    border-radius: 50%;
    pointer-events: none;
    background: radial-gradient(circle, rgba(232, 163, 61, 0.28), transparent 65%);
    filter: blur(14px);
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

  .hero__badge-text {
    white-space: nowrap;
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
  }

  /* параллакс-наклон за курсором — только устройства с hover */
  @media (hover: hover) and (prefers-reduced-motion: no-preference) {
    .home-img {
      transform: perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
      transition: transform 0.18s ease-out;
      will-change: transform;
    }
  }

  /* «сканирующая» линия поверх протокола */
  .home-img__scan {
    position: absolute;
    left: 6%;
    right: 6%;
    top: 0;
    height: 2px;
    border-radius: 2px;
    background: linear-gradient(90deg, transparent, var(--amber) 18%, var(--amber-hi) 50%, var(--amber) 82%, transparent);
    box-shadow: 0 0 14px rgba(232, 163, 61, 0.8), 0 0 40px rgba(232, 163, 61, 0.35);
    opacity: 0;
    animation: scanY 3.6s ease-in-out 1.2s infinite;
    pointer-events: none;
  }

  @keyframes scanY {
    0% { top: 4%; opacity: 0; }
    8% { opacity: 0.85; }
    46% { top: 94%; opacity: 0.85; }
    54% { opacity: 0; }
    100% { top: 4%; opacity: 0; }
  }

  .home-img--hover .home-img__scan {
    opacity: 0;
    animation-play-state: paused;
  }

  @media (prefers-reduced-motion: reduce) {
    .home-img__scan {
      display: none;
    }
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

  /* ── Бегущая строка ── */
  .strip {
    width: 100%;
    overflow: hidden;
    background: var(--green);
    border-radius: var(--radius-md);
    padding: 0.95rem 0;
    box-shadow: 0 14px 34px rgba(47, 90, 74, 0.28);
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent);
    mask-image: linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent);
  }

  .strip__track {
    display: flex;
    width: max-content;
    animation: marquee 28s linear infinite;
    will-change: transform;
  }

  .strip__half {
    display: flex;
    align-items: baseline;
    gap: 1.6rem;
    padding-right: 1.6rem;
  }

  .strip__item {
    font-family: var(--font-d);
    font-weight: 800;
    font-size: clamp(1.05rem, 2.4vw, 1.55rem);
    line-height: 1.1;
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: transparent;
    -webkit-text-stroke: 1px rgba(244, 239, 228, 0.5);
  }

  .strip__item--fill {
    color: var(--amber);
    -webkit-text-stroke: 0;
  }

  .strip__sep {
    color: rgba(244, 239, 228, 0.45);
    font-size: 1.3rem;
  }

  @keyframes marquee {
    to { transform: translateX(-50%); }
  }

  @media (prefers-reduced-motion: reduce) {
    .strip__track {
      animation: none;
    }
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
  }

  @media screen and (max-width: 768px) {
    .home {
      gap: 3rem;
      padding-top: 0.25rem;
    }

    .hero__row {
      padding: 1.5rem 1.25rem 2rem;
    }

    .hero__badge {
      font-size: 0.56rem;
      letter-spacing: 0.22em;
      gap: 0.5rem;
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
