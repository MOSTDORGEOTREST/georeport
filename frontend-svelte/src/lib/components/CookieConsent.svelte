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
  <div class="cookie glass">
    <div class="cookie__body">
      <h4 class="cookie__title">Мы используем файлы cookie.</h4>
      <p class="cookie__text">
        Мы используем Cookies в том числе с использованием сервиса
        веб-аналитики «Яндекс.Метрика». Продолжая использовать
        наш сайт, вы даете
        <a href="/static/docs/Согласие_на_обработку_ПД_на сайт.pdf">согласие</a>
        на обработку данных Cookies в соответствии с
        <a href="/static/docs/Политика_на сайт.pdf">Политикой</a>.
      </p>
      <div class="cookie__actions">
        <button class="btn btn-accent" onclick={accept}>
          Принять
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .cookie {
    position: fixed;
    bottom: 1.5rem;
    left: 1.5rem;
    right: 1.5rem;
    z-index: 1000;
    max-width: 600px;
    margin: 0 auto;
    background: rgba(10, 31, 10, 0.85);
    animation: slideUp 0.4s ease-out;
  }

  .cookie__body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .cookie__title {
    font-size: 1rem;
    color: var(--text-primary);
  }

  .cookie__text {
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .cookie__text a {
    color: var(--accent-light);
    text-decoration: underline;
  }

  .cookie__actions {
    display: flex;
    justify-content: flex-end;
  }

  .cookie__actions .btn {
    padding: 0.5rem 1.25rem;
    font-size: 0.85rem;
  }
</style>
