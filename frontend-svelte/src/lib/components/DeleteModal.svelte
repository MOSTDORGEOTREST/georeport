<script>
  let { onConfirm, onCancel } = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="modal-overlay" onclick={onCancel}>
  <div class="modal glass" onclick={(e) => e.stopPropagation()}>
    <h2 class="modal__title">Удалить отчет?</h2>
    <p class="modal__text">Это действие отменить нельзя.</p>
    <div class="modal__actions">
      <button class="btn btn-glass" onclick={onCancel}>Отмена</button>
      <button class="btn btn-danger" onclick={onConfirm}>Удалить</button>
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
    background: rgba(0, 0, 0, 0.5);
    animation: fadeIn 0.2s ease-out;
  }

  .modal {
    min-width: 280px;
    max-width: 340px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background: rgba(10, 31, 10, 0.95);
    animation: fadeIn 0.3s ease-out;
  }

  .modal__title {
    font-size: 1.1rem;
  }

  .modal__text {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .modal__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .modal__actions .btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
</style>
