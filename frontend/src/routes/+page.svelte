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
          <i class="ri-verified-badge-line" aria-hidden="true"></i>
          Сервис аутентификации протоколов
        </span>

        <h1 class="hero__title">Проект <span class="hero__title-accent">GEOREPORT</span></h1>

        <p class="hero__lead">
          GEOREPORT позволяет аутентифицировать протоколы лабораторных
          испытаний, создавая дополнительную степень защиты данных
          от подделки.
        </p>

        <div class="hero__actions">
          <a class="btn btn-accent hero__btn" href="/login">
            <i class="ri-user-3-line" aria-hidden="true"></i>
            Личный кабинет
          </a>
          <button class="btn btn-glass hero__btn" onclick={() => {
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
          Разработано компанией «АО МОСТДОРГЕОТРЕСТ»
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
        Данный проект позволяет дублировать данные протоколов испытаний на
        специальном сервере, исключая ручные изменения в протоколе вне
        лаборатории.
      </p>
    </div>

    <InfoGraphic />
  </section>

  <section class="section fade-in" id="license">
    <div class="cta glass">
      <div class="cta__icon" aria-hidden="true">
        <i class="ri-flask-line"></i>
      </div>
      <h2 class="cta__title">Подключайте свою лабораторию к нам!</h2>
      <p class="cta__text">
        Для подключения свяжитесь с нами. После покупки Вам станет доступен
        личный кабинет, через который вы сможете аутентифицировать свои
        протоколы.
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
    gap: 3.5rem;
    width: 100%;
    padding-top: 1rem;
  }

  .hero {
    width: 100%;
  }

  .hero__row {
    display: flex;
    align-items: center;
    gap: 3rem;
  }

  .hero__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1.25rem;
  }

  .hero__badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.9rem;
    border-radius: 999px;
    border: 1px solid rgba(143, 168, 84, 0.4);
    background: var(--accent-soft);
    color: var(--accent-bright);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .hero__badge i {
    font-size: 1rem;
  }

  .hero__title {
    font-size: clamp(2.2rem, 5vw, 3.1rem);
    line-height: 1.15;
  }

  .hero__title-accent {
    background: linear-gradient(135deg, var(--accent-bright) 0%, var(--gold) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero__lead {
    color: var(--text-secondary);
    font-size: 1.05rem;
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

  .hero__features {
    display: flex;
    gap: 1.25rem;
    flex-wrap: wrap;
  }

  .hero__feature {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    color: var(--text-secondary);
    font-size: 0.85rem;
    font-weight: 600;
  }

  .hero__feature i {
    color: var(--accent-light);
    font-size: 1.1rem;
  }

  .hero__trust {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .home-img {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
    border-radius: var(--radius-md);
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 24px 60px rgba(39, 57, 42, 0.16), 0 0 0 1px var(--glass-border);
  }

  .home-img::before {
    content: '';
    position: absolute;
    inset: -40%;
    z-index: -1;
    background: radial-gradient(circle at 50% 50%, var(--accent-glow), transparent 65%);
    opacity: 0.5;
  }

  .home-img__image {
    max-height: 420px;
    width: auto;
    border-radius: var(--radius-md);
    transition: transform 0.5s ease;
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
    background: rgba(0, 0, 0, 0);
    border-radius: var(--radius-md);
    transition: all 0.5s ease;
  }

  .home-img--hover .home-img__overlay {
    background: rgba(0, 0, 0, 0.45);
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
    background: rgba(255, 255, 255, 0.15);
    transform: scale(1.35);
  }

  .home-img__qr {
    width: 80px;
    height: auto;
    opacity: 0;
    transition: opacity 0.5s ease;
  }

  .home-img__qr-hint {
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #fff;
    opacity: 0;
    transition: opacity 0.5s ease;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
  }

  .home-img--hover .home-img__qr,
  .home-img--hover .home-img__qr-hint {
    opacity: 1;
  }

  .home-img__qr-wrapper--placeholder {
    cursor: default;
    pointer-events: none;
  }

  .section {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    scroll-margin-top: calc(var(--header-height) + 1rem);
  }

  .section__title {
    font-size: 1.6rem;
    text-align: center;
  }

  .section__text {
    padding: 1.25rem 1.5rem;
    color: var(--text-secondary);
    line-height: 1.7;
    width: 100%;
  }

  .cta {
    position: relative;
    padding: 2.5rem 2rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 100%;
    overflow: hidden;
  }

  .cta::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 70% 90% at 50% -20%, rgba(143, 168, 84, 0.16), transparent 70%);
    pointer-events: none;
  }

  .cta__icon {
    width: 62px;
    height: 62px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--accent-soft);
    border: 1px solid rgba(143, 168, 84, 0.4);
    color: var(--accent-bright);
    font-size: 1.8rem;
  }

  .cta__title {
    font-size: 1.4rem;
    color: var(--text-primary);
  }

  .cta__text {
    color: var(--text-secondary);
    max-width: 600px;
    line-height: 1.6;
  }

  .cta__btn {
    padding: 0.85rem 2.5rem;
    font-size: 1.05rem;
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
    }
  }

  @media screen and (max-width: 768px) {
    .home {
      gap: 2.75rem;
      padding-top: 0.25rem;
    }

    .hero__lead {
      font-size: 0.98rem;
    }

    .hero__actions {
      width: 100%;
      flex-direction: column;
    }

    .hero__btn {
      width: 100%;
    }

    .hero__features {
      gap: 0.75rem 1rem;
    }

    .home-img__image {
      max-height: 320px;
    }

    .home-img--touch .home-img__image {
      transform: scale(calc(1 + 0.02 * var(--scroll-progress, 0)));
      transition: none;
    }

    .home-img--touch .home-img__overlay {
      background: rgba(0, 0, 0, calc(0.45 * var(--scroll-progress, 0)));
      transition: none;
    }

    .home-img--touch .home-img__qr-wrapper {
      background: rgba(255, 255, 255, calc(0.15 * var(--scroll-progress, 0)));
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
