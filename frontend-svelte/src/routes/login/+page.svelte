<script>
  import { onMount } from 'svelte';
  import { logged } from '$lib/stores.js';
  import { get as apiGet, postForm } from '$lib/api.js';
  import Personal from '$lib/components/Personal.svelte';

  let isLogged = $state(false);
  logged.subscribe(v => isLogged = v);

  let username = $state('');
  let password = $state('');
  let error = $state(false);
  let loading = $state(false);

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

{#if !isLogged}
  <div class="login-page">
    <h2 class="login-title">Личный кабинет</h2>

    <form class="login-form glass" onsubmit={handleLogin}>
      <div class="login-form__group">
        <label class="login-form__label" for="login-username">Имя пользователя:</label>
        <input
          class="input-glass"
          class:error
          id="login-username"
          placeholder="Введите имя"
          bind:value={username}
          autocomplete="username"
        />
      </div>

      <div class="login-form__group">
        <label class="login-form__label" for="login-password">Пароль:</label>
        <input
          type="password"
          class="input-glass"
          class:error
          id="login-password"
          placeholder="Введите пароль"
          bind:value={password}
          autocomplete="current-password"
        />
        {#if error}
          <span class="login-form__error">Не верные имя пользователя или пароль.</span>
        {/if}
      </div>

      <button
        type="submit"
        class="btn btn-accent login-form__submit"
        disabled={loading}
      >
        {loading ? 'Вход...' : 'Войти'}
      </button>
    </form>
  </div>
{:else}
  <Personal />
{/if}

<style>
  .login-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    padding-top: 2rem;
    width: 100%;
  }

  .login-title {
    font-size: 1.5rem;
    background: linear-gradient(135deg, var(--text-primary) 0%, var(--accent-light) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .login-form {
    width: 100%;
    max-width: 340px;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .login-form__group {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .login-form__label {
    font-size: 0.85rem;
    color: var(--text-muted);
    font-weight: 600;
  }

  .login-form__error {
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
</style>
