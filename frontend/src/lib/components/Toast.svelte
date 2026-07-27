<script>
  import { toasts, removeToast } from '$lib/stores.js';

  let items = $state([]);
  toasts.subscribe(v => items = v);

  const icons = {
    success: 'ri-checkbox-circle-line',
    error: 'ri-error-warning-line',
    info: 'ri-information-line'
  };
</script>

{#if items.length > 0}
  <div class="toast-container">
    {#each items as toast (toast.id)}
      <div class="toast glass toast--{toast.type}" role="alert">
        <i class="toast__icon {icons[toast.type] || icons.info}" aria-hidden="true"></i>
        <span class="toast__text">{toast.message}</span>
        <button class="toast__close" onclick={() => removeToast(toast.id)} aria-label="Закрыть уведомление">
          <i class="ri-close-line" aria-hidden="true"></i>
        </button>
      </div>
    {/each}
  </div>
{/if}

<style>
  .toast-container {
    position: fixed;
    top: 5.5rem;
    right: 1.5rem;
    z-index: 1001;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 360px;
  }

  .toast {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.75rem 0.9rem;
    animation: slideUp 0.3s ease-out;
    background: var(--surface-elevated);
    border-left: 3px solid var(--glass-border-hover);
  }

  .toast__icon {
    font-size: 1.2rem;
    flex-shrink: 0;
  }

  .toast--success {
    border-left-color: var(--accent-light);
  }

  .toast--success .toast__icon {
    color: var(--accent-bright);
  }

  .toast--error {
    border-left-color: var(--danger);
  }

  .toast--error .toast__icon {
    color: var(--danger);
  }

  .toast--info .toast__icon {
    color: var(--gold);
  }

  .toast__text {
    font-size: 0.85rem;
    color: var(--text-primary);
    flex: 1;
  }

  .toast__close {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 1.1rem;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    transition: var(--transition);
    flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
  }

  .toast__close:hover {
    color: var(--text-primary);
  }

  @media screen and (max-width: 500px) {
    .toast-container {
      left: 1rem;
      right: 1rem;
      max-width: none;
    }
  }
</style>
