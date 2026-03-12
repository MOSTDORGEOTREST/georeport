<script>
  import { onMount } from 'svelte';
  import InfoGraphic from '$lib/components/InfoGraphic.svelte';
  import { get as apiGet } from '$lib/api.js';

  let hovered = $state(false);
  let scrollProgress = $state(0);
  let touchMode = $state(false);
  let reportId = $state(null);
  const SCROLL_END = 400;

  onMount(async () => {
    try {
      const res = await apiGet('/reports/sample_id/');
      if (res.ok) {
        const data = await res.json();
        if (data?.id) reportId = data.id;
      }
    } catch {}

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
        return () => window.removeEventListener('scroll', update);
      }
    }
  });
</script>

<div class="home">
  <section class="hero fade-in">
    <h1 class="hero__title">Проект GEOREPORT</h1>

    <div class="hero__row">
      <div class="hero__content glass">
        <p>
          Данный проект разработан компанией «АО МОСТДОРГЕОТРЕСТ» с целью
          обеспечения гарантии подлинности данных.
        </p>
        <br />
        <p>
          GEOREPORT позволяет аутентифицировать протоколы лабораторных
          испытаний, тем самым создавая дополнительную степень защиты.
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
        <img class="home-img__image" src="/images/mainimg.png" alt="GEOREPORT протокол" />
        <div class="home-img__overlay">
          {#if reportId}
            <a href="/report/{reportId}" class="home-img__qr-wrapper">
              <img src="/images/qr_index.png" alt="QR" class="home-img__qr" />
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
    <div class="section__divider"></div>
    <h2 class="section__title">Описание проекта</h2>

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
    <div class="section__divider"></div>

    <div class="cta glass">
      <h2 class="cta__title">Подключайте свою лабораторию к нам!</h2>
      <p class="cta__text">
        Для подключения свяжитесь с нами. После покупки Вам станет доступен
        личный кабинет, через который вы сможете аутентифицировать свои
        протоколы.
      </p>
      <a class="btn btn-accent cta__btn" href="mailto:tnick1502@mail.ru">
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
    gap: 2.5rem;
    width: 100%;
  }

  .hero {
    text-align: center;
    width: 100%;
  }

  .hero__title {
    font-size: 2.2rem;
    margin-bottom: 1.5rem;
    background: linear-gradient(135deg, var(--text-primary) 0%, var(--accent-light) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero__row {
    display: flex;
    align-items: flex-start;
    gap: 2rem;
  }

  .hero__content {
    flex: 1;
    padding: 1.5rem 2rem;
    text-align: left;
    color: var(--text-secondary);
    line-height: 1.7;
  }

  .home-img {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
    border-radius: var(--radius-md);
    overflow: hidden;
    cursor: pointer;
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
    background: rgba(0, 0, 0, 0.4);
  }

  .home-img__qr-wrapper {
    display: flex;
    padding: 1rem;
    border-radius: var(--radius-md);
    background: rgba(255, 255, 255, 0);
    transition: all 0.5s ease;
    transform: scale(1);
  }

  .home-img--hover .home-img__qr-wrapper {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(1.5);
  }

  .home-img__qr {
    width: 80px;
    height: auto;
    opacity: 0;
    transition: opacity 0.5s ease;
  }

  .home-img--hover .home-img__qr {
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
  }

  .section__divider {
    width: 60px;
    height: 3px;
    background: var(--accent-gradient);
    border-radius: 2px;
  }

  .section__title {
    font-size: 1.5rem;
    text-align: center;
  }

  .section__text {
    padding: 1.25rem 1.5rem;
    color: var(--text-secondary);
    text-align: justify;
    line-height: 1.7;
    width: 100%;
  }

  .cta {
    padding: 2rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 100%;
  }

  .cta__title {
    font-size: 1.3rem;
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
    }

    .home-img {
      max-width: 100%;
    }
  }

  @media screen and (max-width: 768px) {
    .hero__title {
      font-size: 1.7rem;
    }

    .hero__content {
      padding: 1.25rem;
    }

    .home-img__image {
      max-height: 300px;
    }

    .home-img--touch .home-img__image {
      transform: scale(calc(1 + 0.02 * var(--scroll-progress, 0)));
      transition: none;
    }

    .home-img--touch .home-img__overlay {
      background: rgba(0, 0, 0, calc(0.4 * var(--scroll-progress, 0)));
      transition: none;
    }

    .home-img--touch .home-img__qr-wrapper {
      background: rgba(255, 255, 255, calc(0.15 * var(--scroll-progress, 0)));
      transform: scale(calc(1 + 0.5 * var(--scroll-progress, 0)));
      transition: none;
    }

    .home-img--touch .home-img__qr {
      opacity: var(--scroll-progress, 0);
      transition: none;
    }

    .home-img--hover .home-img__qr-wrapper {
      transform: scale(1.2);
    }
  }
</style>
