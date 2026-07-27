<script>
  import { post, put } from '$lib/api.js';
  import { addToast } from '$lib/stores.js';

  let { onfetchObjects, updateData = null, onCancelUpdate } = $props();

  const emptyRows = () => ([
    { key: '', value: '', keyPlaceholder: 'Дата выдачи протокола', valuePlaceholder: '01.09.2022' },
    { key: '', value: '', keyPlaceholder: '', valuePlaceholder: '' },
    { key: '', value: '', keyPlaceholder: '', valuePlaceholder: '' }
  ]);

  let inputObj = $state('');
  let inputLabNo = $state('');
  let inputType = $state('');
  let rows = $state(emptyRows());
  let submitting = $state(false);
  let success = $state(false);
  let errors = $state({});

  let isEditing = $derived(Boolean(updateData?.id));

  $effect(() => {
    if (updateData) {
      inputObj = updateData.object_number || '';
      inputLabNo = updateData.laboratory_number || '';
      inputType = updateData.test_type || '';
      const dataKeys = Object.keys(updateData.data || {});
      // Собираем массив локально и присваиваем один раз: чтение и запись
      // rows внутри одного $effect зацикливает обновления (effect_update_depth_exceeded)
      const next = dataKeys.map(k => ({ key: k, value: updateData.data[k], keyPlaceholder: '', valuePlaceholder: '' }));
      while (next.length < 3) {
        next.push({ key: '', value: '', keyPlaceholder: '', valuePlaceholder: '' });
      }
      rows = next;
      success = false;
      errors = {};
    }
  });

  function addRow() {
    if (rows.length >= 10) return;
    rows = [...rows, { key: '', value: '', keyPlaceholder: '', valuePlaceholder: '' }];
  }

  function removeRowAt(i) {
    if (rows.length <= 3) return;
    rows = rows.filter((_, idx) => idx !== i);
  }

  function resetForm() {
    inputObj = '';
    inputLabNo = '';
    inputType = '';
    rows = emptyRows();
    errors = {};
  }

  function cancelUpdate() {
    resetForm();
    success = false;
    onCancelUpdate?.();
  }

  function downloadBlob(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function handleSubmit() {
    errors = {};
    success = false;

    if (!inputObj) { errors.obj = true; return; }
    if (!inputLabNo) { errors.labNo = true; return; }
    if (!inputType) { errors.type = true; return; }

    let hasRowError = false;
    for (const r of rows) {
      if ((r.key && !r.value) || (!r.key && r.value)) {
        hasRowError = true;
        break;
      }
    }
    if (hasRowError) {
      addToast('Заполните оба поля в параметрах', 'error');
      return;
    }

    const tableData = {};
    for (const r of rows) {
      if (r.key && r.value) tableData[r.key] = r.value;
    }

    submitting = true;

    try {
      let res;
      let reportId = updateData?.id;
      if (updateData?.id) {
        res = await put(`/reports/?id=${updateData.id}`, { data: tableData, active: true });
      } else {
        res = await post('/reports/', {
          object_number: inputObj,
          laboratory_number: inputLabNo,
          test_type: inputType,
          data: tableData,
          active: true
        });
      }

      if (!res.ok) {
        errors = { obj: true, labNo: true, type: true };
        addToast('Ошибка сервера', 'error');
        submitting = false;
        return;
      }

      success = true;

      if (!reportId) {
        const createdReport = await res.json();
        reportId = createdReport?.id;
      }

      if (reportId) {
        const qrRes = await post(`/reports/qr/?id=${encodeURIComponent(reportId)}`, null, false);
        if (qrRes.ok) {
          const blob = await qrRes.blob();
          downloadBlob(blob, `${inputObj} - ${inputLabNo} - ${inputType}.png`);
        } else {
          addToast('Протокол сохранён, но QR-код не удалось загрузить', 'error');
        }
      } else {
        addToast('Протокол сохранён, но сервер не вернул его ID', 'error');
      }

      onfetchObjects?.();
      resetForm();
      if (updateData?.id) onCancelUpdate?.();
    } catch {
      addToast('Ошибка сети', 'error');
    }

    submitting = false;
  }

  let canSubmit = $derived(inputObj.length > 0 && inputLabNo.length > 0 && inputType.length > 0);
</script>

<div class="form-wrapper glass" id="report-form">
  <div class="form-head">
    <div class="form-head__title-row">
      <h2 class="form-head__title">
        <i class={isEditing ? 'ri-edit-2-line' : 'ri-file-add-line'} aria-hidden="true"></i>
        {isEditing ? 'Редактирование протокола' : 'Новый протокол'}
      </h2>
      {#if isEditing}
        <button type="button" class="form-head__cancel" onclick={cancelUpdate}>
          <i class="ri-close-line" aria-hidden="true"></i>
          Отменить
        </button>
      {/if}
    </div>
    {#if isEditing}
      <p class="form-desc form-desc--editing">
        Вы обновляете параметры протокола
        <strong>{inputObj} — {inputLabNo} — {inputType}</strong>.
        После сохранения будет скачан новый QR-код.
      </p>
    {:else}
      <p class="form-desc">
        Уникальный номер протокола формируется по номеру объекта, лаб.номеру и
        типу испытания, поэтому для разных протоколов эти параметры должны
        отличаться.
      </p>
    {/if}
  </div>

  <form class="form" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
    <div class="form__row form__row--main">
      <div class="form__group">
        <label class="form__label" for="inputObj">Объект *</label>
        <input
          class="input-glass"
          class:error={errors.obj}
          id="inputObj"
          placeholder="111-11"
          bind:value={inputObj}
          disabled={isEditing}
        />
      </div>
      <div class="form__group">
        <label class="form__label" for="inputLabNo">Лаб.№ *</label>
        <input
          class="input-glass"
          class:error={errors.labNo}
          id="inputLabNo"
          placeholder="A1-1/AA"
          bind:value={inputLabNo}
          disabled={isEditing}
        />
      </div>
      <div class="form__group">
        <label class="form__label" for="inputType">Тип испытания *</label>
        <input
          class="input-glass"
          class:error={errors.type}
          id="inputType"
          placeholder="FC, FCE, вибро..."
          bind:value={inputType}
          disabled={isEditing}
        />
      </div>
    </div>

    <div class="form__params-head">
      <span class="form__label">Параметры протокола</span>
      <span class="form__params-count">{rows.length} / 10</span>
    </div>

    {#each rows as row, i}
      <div class="form__row form__row--pair">
        <input
          class="input-glass"
          placeholder={row.keyPlaceholder || 'Параметр'}
          aria-label="Параметр {i + 1}"
          bind:value={row.key}
        />
        <input
          class="input-glass"
          placeholder={row.valuePlaceholder || 'Значение'}
          aria-label="Значение {i + 1}"
          bind:value={row.value}
        />
        <button
          type="button"
          class="form__row-remove"
          onclick={() => removeRowAt(i)}
          disabled={rows.length <= 3}
          aria-label="Удалить строку {i + 1}"
          title="Удалить строку"
        >
          <i class="ri-close-line" aria-hidden="true"></i>
        </button>
      </div>
    {/each}

    <button
      type="button"
      class="form__add-row"
      onclick={addRow}
      disabled={rows.length >= 10}
    >
      <i class="ri-add-line" aria-hidden="true"></i>
      Добавить параметр
    </button>

    <button
      type="submit"
      class="btn btn-accent form__submit"
      disabled={!canSubmit || submitting}
    >
      {#if submitting}
        <i class="ri-loader-4-line form__spinner" aria-hidden="true"></i>
        Отправка...
      {:else}
        <i class={isEditing ? 'ri-save-3-line' : 'ri-qr-code-line'} aria-hidden="true"></i>
        {isEditing ? 'Сохранить изменения' : 'Создать протокол'}
      {/if}
    </button>
  </form>

  {#if success}
    <div class="form__success fade-in" role="status">
      <i class="ri-checkbox-circle-line" aria-hidden="true"></i>
      Данные успешно отправлены!
      <span class="form__success-sub">Дождитесь загрузки QR-кода</span>
    </div>
  {/if}
</div>

<style>
  .form-wrapper {
    padding: 1.5rem;
    width: 100%;
    scroll-margin-top: calc(var(--header-height) + 1rem);
  }

  .form-head {
    margin-bottom: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-head__title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .form-head__title {
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .form-head__title i {
    color: var(--accent-light);
    font-size: 1.25rem;
  }

  .form-head__cancel {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    background: none;
    border: 1px solid var(--glass-border);
    border-radius: 999px;
    color: var(--text-muted);
    font-family: inherit;
    font-size: 0.8rem;
    font-weight: 600;
    padding: 0.35rem 0.85rem;
    transition: var(--transition);
  }

  .form-head__cancel:hover {
    color: var(--text-primary);
    border-color: var(--glass-border-hover);
  }

  .form-desc {
    color: var(--text-secondary);
    font-size: 0.85rem;
    line-height: 1.5;
  }

  .form-desc--editing {
    color: var(--gold);
    background: var(--gold-soft);
    border: 1px solid rgba(211, 164, 98, 0.35);
    border-radius: var(--radius-sm);
    padding: 0.6rem 0.9rem;
  }

  .form-desc--editing strong {
    color: var(--text-primary);
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .form__row {
    display: flex;
    gap: 0.75rem;
  }

  .form__row--main {
    flex-wrap: wrap;
  }

  .form__row--main .form__group {
    flex: 1;
    min-width: 150px;
  }

  .form__group {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .form__label {
    font-size: 0.8rem;
    color: var(--text-muted);
    font-weight: 600;
  }

  .form__params-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.5rem;
  }

  .form__params-count {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-weight: 600;
  }

  .form__row--pair {
    align-items: center;
  }

  .form__row--pair .input-glass {
    flex: 1;
    min-width: 0;
  }

  .form__row-remove {
    width: 40px;
    height: 40px;
    min-width: 40px;
    border-radius: var(--radius-sm);
    background: none;
    border: 1px solid transparent;
    color: var(--text-muted);
    font-size: 1.15rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition);
    -webkit-tap-highlight-color: transparent;
  }

  .form__row-remove:hover:not(:disabled) {
    color: var(--danger);
    background: var(--danger-soft);
    border-color: rgba(217, 83, 79, 0.35);
  }

  .form__row-remove:disabled {
    opacity: 0.25;
    cursor: not-allowed;
  }

  .form__add-row {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    align-self: flex-start;
    background: none;
    border: 1px dashed var(--glass-border-hover);
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
    font-family: inherit;
    font-size: 0.85rem;
    font-weight: 600;
    padding: 0.55rem 1rem;
    min-height: 42px;
    transition: var(--transition);
    -webkit-tap-highlight-color: transparent;
  }

  .form__add-row:hover:not(:disabled) {
    color: var(--accent-bright);
    border-color: var(--accent-light);
    background: var(--accent-soft);
  }

  .form__add-row:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .form__submit {
    width: 100%;
    padding: 0.85rem;
    font-size: 1rem;
    margin-top: 0.25rem;
  }

  .form__spinner {
    display: inline-block;
    animation: spin 0.9s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .form__success {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    color: var(--accent-bright);
    margin-top: 1rem;
    font-weight: 600;
    background: var(--accent-soft);
    border: 1px solid rgba(143, 168, 84, 0.35);
    border-radius: var(--radius-sm);
    padding: 0.8rem;
  }

  .form__success i {
    font-size: 1.4rem;
  }

  .form__success-sub {
    font-size: 0.8rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  @media screen and (max-width: 500px) {
    .form-wrapper {
      padding: 1.25rem 1rem;
    }

    .form__row--pair {
      display: grid;
      grid-template-columns: 1fr auto;
      grid-template-areas:
        'key remove'
        'value remove';
      gap: 0.5rem;
      background: var(--surface-soft);
      border: 1px solid var(--line-soft);
      border-radius: var(--radius-sm);
      padding: 0.6rem;
    }

    .form__row--pair .input-glass:first-child {
      grid-area: key;
    }

    .form__row--pair .input-glass:nth-child(2) {
      grid-area: value;
    }

    .form__row-remove {
      grid-area: remove;
      align-self: center;
    }

    .form__add-row {
      width: 100%;
    }
  }
</style>
