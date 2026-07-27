<script>
  let { message = '', onClose } = $props();

  let isSuccess = $derived(message.includes('скопирован'));

  function onKeydown(e) {
    if (e.key === 'Escape') onClose?.();
  }
</script>

<svelte:window onkeydown={onKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="modal-overlay" onclick={onClose}>
  <div class="modal glass" role="dialog" aria-modal="true" aria-labelledby="token-modal-title" tabindex="-1" onclick={(e) => e.stopPropagation()}>
    <div class="modal__icon" class:modal__icon--success={isSuccess} class:modal__icon--info={!isSuccess} aria-hidden="true">
      <i class={isSuccess ? 'ri-clipboard-line' : 'ri-key-2-line'}></i>
    </div>
    <h2 class="modal__title" id="token-modal-title">Получение токена</h2>
    <p class="modal__text">{message}</p>
    <div class="modal__actions">
      <button class="btn btn-accent" onclick={onClose}>Хорошо</button>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 1002;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--overlay);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    animation: fadeIn 0.2s ease-out;
    padding: 1rem;
  }

  .modal {
    width: 100%;
    max-width: 360px;
    padding: 1.75rem 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.75rem;
    background: var(--surface-elevated);
    animation: scaleIn 0.25s ease-out;
  }

  .modal__icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.6rem;
    margin-bottom: 0.25rem;
  }

  .modal__icon--success {
    background: var(--accent-soft);
    border: 1px solid rgba(143, 168, 84, 0.45);
    color: var(--accent-bright);
  }

  .modal__icon--info {
    background: var(--gold-soft);
    border: 1px solid rgba(211, 164, 98, 0.45);
    color: var(--gold);
  }

  .modal__title {
    font-size: 1.15rem;
  }

  .modal__text {
    color: var(--text-secondary);
    font-size: 0.88rem;
    line-height: 1.55;
  }

  .modal__actions {
    display: flex;
    justify-content: center;
    margin-top: 0.5rem;
    width: 100%;
  }

  .modal__actions .btn {
    padding: 0.6rem 1.5rem;
    font-size: 0.88rem;
    width: 100%;
  }
</style>
