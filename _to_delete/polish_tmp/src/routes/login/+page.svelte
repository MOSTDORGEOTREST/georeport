<script>
  import { onMount } from 'svelte';
  import { logged } from '$lib/stores.js';
  import { get as apiGet, postForm } from '$lib/api.js';
  import Personal from '$lib/components/Personal.svelte';
  import Loader from '$lib/components/Loader.svelte';

  let isLogged = $state(false);
  logged.subscribe(v => isLogged = v);

  let username = $state('');
  let password = $state('');
  let error = $state(false);
  let loading = $state(false);
  let showPassword = $state(false);
  let checking = $state(true);

  onMount(async () => {
    try {
      const res = await apiGet('/auth/user/');
      if (res.ok && res.status === 200) {
        logged.set(true);
      } else {
        logged.set(false);
      }
    } catch {
      logged.set(false);
    }
    checking = false;
  });

  async function handleLogin(e) {
    e.preventDefault();
    error = false;

    if (!username || !password) {
      error = true;
      return;
    }

    loading = true;

    try {
      const res = await postForm(
        '/auth/sign-in/',
        `grant_type=password&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
      );

      if (res.ok && res.status === 200) {
        logged.set(true);
      } else {
        error = true;
        logged.set(false);
      }
    } catch {
      error = true;
    }

    loading = false;
  }
</script>

<svelte:head>
  <title>Личный кабинет — GEOREPORT</title>
</svelte:head>

{#if checking}
  <Loader />
{:else if !isLogged}
  <div class="login-page fade-in">
    <div class="login-icon" aria-hidden="true">
      <i class="ri-shield-user-line"></i>
    </div>
    <h1 class="login-title">Личный кабинет</h1>
    <p class="login-sub">Войдите, чтобы выпускать протоколы и управлять ими</p>

    <form class="login-form glass" class:login-form--shake={error} onsubmit={handleLogin}>
      <div class="login-form__group">
        <label class="login-form__label" for="login-username">Имя пользователя</label>
        <div class="login-form__field">
          <i class="ri-user-3-line login-form__field-icon" aria-hidden="true"></i>
          <input
            class="input-glass login-form__input"
            class:error
            id="login-username"
            placeholder="Введите имя"
            bind:value={username}
            autocomplete="username"
            oninput={() => error = false}
          />
        </div>
      </div>

      <div class="login-form__group">
        <label class="login-form__label" for="login-password">Пароль</label>
        <div class="login-form__field">
          <i class="ri-lock-2-line login-form__field-icon" aria-hidden="true"></i>
          <input
            type={showPassword ? 'text' : 'password'}
            class="input-glass login-form__input login-form__input--password"
            class:error
            id="login-password"
            placeholder="Введите пароль"
            bind:value={password}
            autocomplete="current-password"
            oninput={() => error = false}
          />
          <button
            type="button"
            class="login-form__toggle"
            onclick={() => showPassword = !showPassword}
            aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
            tabindex="-1"
          >
            <i class={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} aria-hidden="true"></i>
          </button>
        </div>
        {#if error}
          <span class="login-form__error" role="alert">
            <i class="ri-error-warning-line" aria-hidden="true"></i>
            Неверные имя пользователя или пароль
          </span>
        {/if}
      </div>

      <button
        type="submit"
        class="btn btn-accent login-form__submit"
        disabled={loading}
      >
        {#if loading}
          <i class="ri-loader-4-line login-form__spinner" aria-hidden="true"></i>
          Вход...
        {:else}
          <i class="ri-login-box-line" aria-hidden="true"></i>
          Войти
        {/if}
      </button>
    </form>

    <p class="login-hint">
      Нет доступа? <a href="/#license">Узнайте, как подключить лабораторию</a>
    </p>
  </div>
{:else}
  <Personal />
{/if}

<style>
  .login-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding-top: 2rem;
    width: 100%;
  }

  .login-icon {
    width: 68px;
    height: 68px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--accent-soft);
    border: 1px solid rgba(166, 106, 20, 0.4);
    color: var(--accent);
    font-size: 2rem;
    margin-bottom: 0.25rem;
  }

  .login-title {
    font-family: var(--font-d);
    font-weight: 600;
    font-size: 1.6rem;
  }

  .login-sub {
    color: var(--text-muted);
    font-size: 0.9rem;
    text-align: center;
  }

  .login-form {
    position: relative;
    width: 100%;
    max-width: 380px;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    margin-top: 1rem;
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .login-form::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 4px;
    background: var(--strata);
    opacity: 0.9;
  }

  .login-form--shake {
    animation: shake 0.35s ease-in-out;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-7px); }
    50% { transform: translateX(6px); }
    75% { transform: translateX(-4px); }
  }

  .login-form__group {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .login-form__label {
    font-family: var(--font-m);
    font-size: 0.66rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--text-muted);
    font-weight: 500;
  }

  .login-form__field {
    position: relative;
    display: flex;
    align-items: center;
  }

  .login-form__field-icon {
    position: absolute;
    left: 0.9rem;
    color: var(--text-muted);
    font-size: 1.05rem;
    pointer-events: none;
  }

  .login-form__input {
    padding-left: 2.6rem;
  }

  .login-form__input--password {
    padding-right: 2.8rem;
  }

  .login-form__toggle {
    position: absolute;
    right: 0.35rem;
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 1.1rem;
    border-radius: var(--radius-sm);
    transition: var(--transition);
    -webkit-tap-highlight-color: transparent;
  }

  .login-form__toggle:hover {
    color: var(--text-primary);
  }

  .login-form__error {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.8rem;
    color: var(--danger);
    margin-top: 0.25rem;
  }

  .login-form__submit {
    width: 100%;
    padding: 0.85rem;
    font-size: 1rem;
    margin-top: 0.5rem;
  }

  .login-form__spinner {
    display: inline-block;
    animation: spin 0.9s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .login-hint {
    font-size: 0.82rem;
    color: var(--text-muted);
    margin-top: 0.5rem;
    text-align: center;
  }

  @media screen and (max-width: 500px) {
    .login-page {
      padding-top: 1rem;
    }

    .login-form {
      padding: 1.5rem 1.25rem;
      max-width: none;
    }
  }
</style>
