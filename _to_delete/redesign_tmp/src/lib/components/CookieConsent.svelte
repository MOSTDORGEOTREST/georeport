<script>
  let visible = $state(false);

  function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let c of ca) {
      c = c.trim();
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
    }
    return null;
  }

  function setCookie(name, value, days) {
    let expires = '';
    if (days) {
      const d = new Date();
      d.setTime(d.getTime() + days * 86400000);
      expires = '; expires=' + d.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/';
  }

  $effect(() => {
    if (!getCookie('allowCookies')) {
      visible = true;
    }
  });

  function accept() {
    setCookie('allowCookies', '1', 365);
    visible = false;
  }
</script>

{#if visible}
  <div class="cookie glass" role="region" aria-label="Согласие на использование cookie">
    <div class="cookie__body">
      <div class="cookie__icon" aria-hidden="true">
        <i class="ri-cake-line"></i>
      </div>
      <p class="cookie__text">
        Мы используем Cookies, в том числе сервис веб-аналитики
        «Яндекс.Метрика». Продолжая использовать сайт, вы даёте
        <a href="/static/docs/Согласие_на_обработку_ПД_на сайт.pdf" target="_blank" rel="noreferrer">согласие</a>
        на обработку данных в соответствии с
        <a href="/static/docs/Политика_на сайт.pdf" target="_blank" rel="noreferrer">Политикой</a>.
      </p>
      <button class="btn btn-accent cookie__btn" onclick={accept}>
        Принять
      </button>
    </div>
  </div>
{/if}

<style>
  .cookie {
    position: fixed;
    bottom: calc(1rem + var(--safe-bottom));
    left: 1rem;
    right: 1rem;
    z-index: 150; /* ниже мобильного меню (200) и модалок */
    max-width: 640px;
    margin: 0 auto;
    background: var(--surface-elevated);
    box-shadow: 0 20px 50px rgba(34, 26, 14, 0.2);
    animation: slideUp 0.4s ease-out;
  }

  .cookie__body {
    padding: 0.9rem 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.9rem;
  }

  .cookie__icon {
    width: 40px;
    height: 40px;
    min-width: 40px;
    border-radius: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--accent-soft);
    color: var(--accent);
    font-size: 1.2rem;
  }

  .cookie__text {
    font-size: 0.8rem;
    color: var(--text-secondary);
    line-height: 1.5;
    flex: 1;
  }

  .cookie__text a {
    color: var(--accent);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .cookie__btn {
    padding: 0.5rem 1.25rem;
    font-size: 0.85rem;
    min-height: 40px;
    white-space: nowrap;
  }

  @media screen and (max-width: 600px) {
    .cookie {
      left: 0.6rem;
      right: 0.6rem;
    }

    .cookie__body {
      flex-wrap: wrap;
      padding: 0.9rem;
    }

    .cookie__text {
      flex-basis: calc(100% - 3.2rem);
    }

    .cookie__btn {
      width: 100%;
    }
  }
</style>
