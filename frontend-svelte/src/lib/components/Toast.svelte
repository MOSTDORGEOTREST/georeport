<script>
  import { toasts, removeToast } from '$lib/stores.js';

  let items = $state([]);
  toasts.subscribe(v => items = v);
</script>

{#if items.length > 0}
  <div class="toast-container">
    {#each items as toast (toast.id)}
      <div class="toast glass toast--{toast.type}" role="alert">
        <span class="toast__text">{toast.message}</span>
        <button class="toast__close" onclick={() => removeToast(toast.id)}>
          <i class="ri-close-line"></i>
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
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    animation: slideUp 0.3s ease-out;
    background: rgba(10, 31, 10, 0.9);
  }

  .toast--success {
    border-color: var(--accent);
  }

  .toast--error {
    border-color: var(--danger);
  }

  .toast__text {
    font-size: 0.85rem;
    color: var(--text-primary);
  }

  .toast__close {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 1.1rem;
    cursor: pointer;
    padding: 0;
    transition: var(--transition);
  }

  .toast__close:hover {
    color: var(--text-primary);
  }
</style>
