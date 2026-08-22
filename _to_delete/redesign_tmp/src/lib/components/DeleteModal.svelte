<script>
  let { onConfirm, onCancel } = $props();

  function onKeydown(e) {
    if (e.key === 'Escape') onCancel?.();
  }
</script>

<svelte:window onkeydown={onKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="modal-overlay" onclick={onCancel}>
  <div class="modal glass" role="alertdialog" aria-modal="true" aria-labelledby="delete-modal-title" tabindex="-1" onclick={(e) => e.stopPropagation()}>
    <div class="modal__icon modal__icon--danger" aria-hidden="true">
      <i class="ri-delete-bin-6-line"></i>
    </div>
    <h2 class="modal__title" id="delete-modal-title">Удалить протокол?</h2>
    <p class="modal__text">
      Протокол и его QR-код перестанут действовать.
      Это действие отменить нельзя.
    </p>
    <div class="modal__actions">
      <button class="btn btn-glass" onclick={onCancel}>Отмена</button>
      <button class="btn btn-danger" onclick={onConfirm}>
        <i class="ri-delete-bin-6-line" aria-hidden="true"></i>
        Удалить
      </button>
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

  .modal__icon--danger {
    background: var(--danger-soft);
    border: 1px solid rgba(179, 64, 47, 0.4);
    color: var(--danger);
  }

  .modal__title {
    font-family: var(--font-d);
    font-weight: 600;
    font-size: 1.1rem;
  }

  .modal__text {
    color: var(--text-secondary);
    font-size: 0.88rem;
    line-height: 1.55;
  }

  .modal__actions {
    display: flex;
    justify-content: center;
    gap: 0.6rem;
    margin-top: 0.5rem;
    width: 100%;
  }

  .modal__actions .btn {
    padding: 0.6rem 1.1rem;
    font-size: 0.88rem;
    flex: 1;
  }
</style>
