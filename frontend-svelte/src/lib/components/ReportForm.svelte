<script>
  import { get as apiGet, post, put } from '$lib/api.js';
  import { addToast } from '$lib/stores.js';

  let { onfetchObjects, updateData = null } = $props();

  let inputObj = $state('');
  let inputLabNo = $state('');
  let inputType = $state('');
  let rows = $state([
    { key: '', value: '', keyPlaceholder: 'Дата выдачи протокола', valuePlaceholder: '01.09.2022' },
    { key: '', value: '', keyPlaceholder: '', valuePlaceholder: '' },
    { key: '', value: '', keyPlaceholder: '', valuePlaceholder: '' }
  ]);
  let submitting = $state(false);
  let success = $state(false);
  let errors = $state({});

  $effect(() => {
    if (updateData) {
      inputObj = updateData.object_number || '';
      inputLabNo = updateData.laboratory_number || '';
      inputType = updateData.test_type || '';
      const dataKeys = Object.keys(updateData.data || {});
      rows = dataKeys.map(k => ({ key: k, value: updateData.data[k], keyPlaceholder: '', valuePlaceholder: '' }));
      while (rows.length < 3) {
        rows.push({ key: '', value: '', keyPlaceholder: '', valuePlaceholder: '' });
      }
      success = false;
      errors = {};
    }
  });

  function addRow() {
    if (rows.length >= 10) return;
    rows = [...rows, { key: '', value: '', keyPlaceholder: '', valuePlaceholder: '' }];
  }

  function removeRow() {
    if (rows.length <= 3) return;
    rows = rows.slice(0, -1);
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

      const reportId = updateData?.id || 0;
      const qrRes = await post(`/reports/qr/?id=${reportId}`, null, false);
      if (qrRes.ok) {
        const blob = await qrRes.blob();
        downloadBlob(blob, `${inputObj} - ${inputLabNo} - ${inputType}`);
      }

      onfetchObjects?.();
      inputObj = '';
      inputLabNo = '';
      inputType = '';
      rows = [
        { key: '', value: '', keyPlaceholder: 'Дата выдачи протокола', valuePlaceholder: '01.09.2022' },
        { key: '', value: '', keyPlaceholder: '', valuePlaceholder: '' },
        { key: '', value: '', keyPlaceholder: '', valuePlaceholder: '' }
      ];
    } catch {
      addToast('Ошибка сети', 'error');
    }

    submitting = false;
  }

  let canSubmit = $derived(inputObj.length > 0 && inputLabNo.length > 0 && inputType.length > 0);
</script>

<div class="form-wrapper glass">
  <p class="form-desc">
    Уникальный номер протокола формируется по номеру объекта, лаб.номеру и
    типу испытания, поэтому для разных протоколов эти параметры должны
    отличаться.
  </p>

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
        />
      </div>
    </div>

    {#each rows as row, i}
      <div class="form__row form__row--pair">
        <div class="form__group">
          {#if i === 0}<label class="form__label">Параметр</label>{/if}
          <input
            class="input-glass"
            placeholder={row.keyPlaceholder}
            bind:value={row.key}
          />
        </div>
        <div class="form__group">
          {#if i === 0}<label class="form__label">Значение</label>{/if}
          <input
            class="input-glass"
            placeholder={row.valuePlaceholder}
            bind:value={row.value}
          />
        </div>
      </div>
    {/each}

    <div class="form__actions-row">
      <button type="button" class="btn btn-glass form__action-btn" onclick={addRow} title="Добавить строку">
        <i class="ri-add-line"></i>
      </button>
      <button type="button" class="btn btn-glass form__action-btn" onclick={removeRow} title="Удалить строку">
        <i class="ri-subtract-line"></i>
      </button>
    </div>

    <button
      type="submit"
      class="btn btn-accent form__submit"
      disabled={!canSubmit || submitting}
    >
      {submitting ? 'Отправка...' : 'Отправить'}
    </button>
  </form>

  {#if success}
    <div class="form__success fade-in">
      Данные успешно отправлены!
      <span class="form__success-sub">Дождитесь загрузки QR-кода</span>
    </div>
  {/if}
</div>

<style>
  .form-wrapper {
    padding: 1.5rem;
    width: 100%;
  }

  .form-desc {
    color: var(--text-secondary);
    font-size: 0.85rem;
    margin-bottom: 1.25rem;
    text-align: justify;
    line-height: 1.5;
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

  .form__row--pair .form__group {
    flex: 1;
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

  .form__actions-row {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
  }

  .form__action-btn {
    padding: 0.5rem 0.75rem;
    font-size: 1.1rem;
  }

  .form__submit {
    width: 100%;
    padding: 0.85rem;
    font-size: 1rem;
  }

  .form__success {
    text-align: center;
    color: var(--accent-light);
    margin-top: 0.75rem;
    font-weight: 600;
  }

  .form__success-sub {
    display: block;
    font-size: 0.8rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  @media screen and (max-width: 500px) {
    .form__row--pair {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
</style>
