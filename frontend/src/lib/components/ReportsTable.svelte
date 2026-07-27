<script>
  import { onMount } from 'svelte';
  import { post, del } from '$lib/api.js';
  import { addToast } from '$lib/stores.js';
  import DeleteModal from './DeleteModal.svelte';

  let { objectsData = [], objects = [], onfetchObjects, onUpdateReport } = $props();
  let dropdownWrapper;

  let selectedObj = $state(null);
  let page = $state(0);
  let pageLim = 9;
  let showDropdown = $state(false);
  let objectSearchQuery = $state('');
  let deleteId = $state(null);
  let showDeleteModal = $state(false);

  let filteredObjects = $derived(
    !objectSearchQuery.trim()
      ? objects
      : objects.filter(obj =>
          String(obj).toLowerCase().includes(objectSearchQuery.trim().toLowerCase())
        )
  );

  let filteredData = $derived(
    [...(selectedObj ? objectsData.filter(r => r.object_number === selectedObj) : objectsData)]
      .sort((a, b) => {
        const da = a.datetime ? new Date(a.datetime).getTime() : 0;
        const db = b.datetime ? new Date(b.datetime).getTime() : 0;
        return db - da;
      })
  );

  let totalPages = $derived(Math.max(1, Math.ceil(filteredData.length / pageLim)));
  let pageData = $derived(filteredData.slice(page * pageLim, page * pageLim + pageLim));

  function getPageNumbers() {
    const total = totalPages;
    const current = page + 1;
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l !== undefined) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  }

  function selectObject(obj) {
    selectedObj = obj;
    page = 0;
    showDropdown = false;
    objectSearchQuery = '';
  }

  function formatDate(dt) {
    if (!dt) return '';
    const d = new Date(dt);
    if (isNaN(d)) return dt.split('T')[0] || '';
    return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
  }

  onMount(() => {
    const handleClickOutside = (e) => {
      if (showDropdown && dropdownWrapper && !dropdownWrapper.contains(e.target)) {
        showDropdown = false;
      }
    };
    const handleKeydown = (e) => {
      if (e.key === 'Escape') showDropdown = false;
    };
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeydown);
    };
  });

  function downloadBlob(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function downloadQr(report) {
    try {
      const res = await post(`/reports/qr/?id=${encodeURIComponent(report.id)}`, null, false);
      if (res.ok) {
        const blob = await res.blob();
        downloadBlob(blob, `${report.object_number} - ${report.laboratory_number} - ${report.test_type}.png`);
        addToast('QR-код загружен', 'success');
      } else {
        addToast('Ошибка загрузки QR', 'error');
      }
    } catch {
      addToast('Ошибка загрузки QR', 'error');
    }
  }

  function handleUpdate(report) {
    onUpdateReport?.(report);
    // Плавно подводим к форме редактирования
    const form = document.querySelector('#report-form');
    if (form) {
      const top = form.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  function confirmDelete(id) {
    deleteId = id;
    showDeleteModal = true;
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      const res = await del(`/reports/?id=${encodeURIComponent(deleteId)}`);
      if (!res.ok) {
        addToast('Не удалось удалить протокол', 'error');
        return;
      }
      showDeleteModal = false;
      deleteId = null;
      addToast('Протокол удалён', 'success');
      onfetchObjects?.();
    } catch {
      addToast('Ошибка удаления', 'error');
    }
  }
</script>

<section class="reports-section glass">
  <div class="reports-head">
    <h2 class="reports-title">
      <i class="ri-archive-stack-line" aria-hidden="true"></i>
      Выданные протоколы
      {#if filteredData.length > 0}
        <span class="reports-count">{filteredData.length}</span>
      {/if}
    </h2>

    <div class="dropdown-wrapper" bind:this={dropdownWrapper}>
      <button
        class="btn btn-glass dropdown-btn"
        class:dropdown-btn--active={selectedObj}
        onclick={() => showDropdown = !showDropdown}
        aria-haspopup="listbox"
        aria-expanded={showDropdown}
      >
        <i class="ri-filter-3-line" aria-hidden="true"></i>
        {selectedObj || 'Все объекты'}
        <i class="ri-arrow-down-s-line" aria-hidden="true"></i>
      </button>
      {#if showDropdown}
        <div class="dropdown-menu glass">
          {#if objects.length > 10}
            <div class="dropdown-search">
              <input
                type="text"
                class="input-glass dropdown-search__input"
                placeholder="Поиск объекта..."
                bind:value={objectSearchQuery}
                onkeydown={(e) => e.stopPropagation()}
              />
            </div>
          {/if}
          <div class="dropdown-list" role="listbox">
            <button class="dropdown-item" class:dropdown-item--selected={!selectedObj} onclick={() => selectObject(null)}>
              Все объекты
            </button>
            {#each filteredObjects as obj}
              <button class="dropdown-item" class:dropdown-item--selected={selectedObj === obj} onclick={() => selectObject(obj)}>
                {obj}
              </button>
            {/each}
            {#if objects.length > 10 && filteredObjects.length === 0}
              <div class="dropdown-item dropdown-item--empty">Ничего не найдено</div>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Таблица (десктоп) -->
  <div class="table-wrapper">
    <table class="table">
      <thead>
        <tr>
          <th>Дата выдачи</th>
          <th>Объект</th>
          <th>Лаб. номер</th>
          <th>Тип испытания</th>
          <th>Информация</th>
          <th class="table__actions-col">Действия</th>
        </tr>
      </thead>
      <tbody>
        {#each pageData as report}
          <tr>
            <td class="table__date">{formatDate(report.datetime)}</td>
            <td><span class="chip chip--obj">{report.object_number}</span></td>
            <td>{report.laboratory_number}</td>
            <td><span class="chip chip--type">{report.test_type}</span></td>
            <td>
              {#each Object.entries(report.data || {}) as [key, val]}
                <div class="data-row"><span class="data-row__key">{key}:</span> {val}</div>
              {/each}
            </td>
            <td>
              <div class="actions">
                <button
                  class="action-btn action-btn--edit"
                  title="Редактировать"
                  aria-label="Редактировать протокол {report.laboratory_number}"
                  onclick={() => handleUpdate(report)}
                >
                  <i class="ri-edit-2-line" aria-hidden="true"></i>
                </button>
                <button
                  class="action-btn action-btn--download"
                  title="Скачать QR"
                  aria-label="Скачать QR протокола {report.laboratory_number}"
                  onclick={() => downloadQr(report)}
                >
                  <i class="ri-download-2-line" aria-hidden="true"></i>
                </button>
                <button
                  class="action-btn action-btn--delete"
                  title="Удалить"
                  aria-label="Удалить протокол {report.laboratory_number}"
                  onclick={() => confirmDelete(report.id)}
                >
                  <i class="ri-delete-bin-6-line" aria-hidden="true"></i>
                </button>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- Карточки (мобильный) -->
  <div class="cards">
    {#each pageData as report}
      <article class="card">
        <div class="card__top">
          <div class="card__ids">
            <span class="chip chip--obj">{report.object_number}</span>
            <span class="card__lab">{report.laboratory_number}</span>
            <span class="chip chip--type">{report.test_type}</span>
          </div>
          <span class="card__date">
            <i class="ri-calendar-line" aria-hidden="true"></i>
            {formatDate(report.datetime)}
          </span>
        </div>

        {#if Object.keys(report.data || {}).length > 0}
          <div class="card__data">
            {#each Object.entries(report.data || {}) as [key, val]}
              <div class="data-row"><span class="data-row__key">{key}:</span> {val}</div>
            {/each}
          </div>
        {/if}

        <div class="card__actions">
          <button class="card-btn" onclick={() => handleUpdate(report)}>
            <i class="ri-edit-2-line" aria-hidden="true"></i>
            Изменить
          </button>
          <button class="card-btn" onclick={() => downloadQr(report)}>
            <i class="ri-download-2-line" aria-hidden="true"></i>
            QR
          </button>
          <button class="card-btn card-btn--danger" onclick={() => confirmDelete(report.id)}>
            <i class="ri-delete-bin-6-line" aria-hidden="true"></i>
            Удалить
          </button>
        </div>
      </article>
    {/each}
  </div>

  {#if pageData.length === 0}
    <div class="empty">
      <i class="ri-inbox-2-line" aria-hidden="true"></i>
      <p>{selectedObj ? 'По этому объекту протоколов нет' : 'Протоколов пока нет'}</p>
      {#if selectedObj}
        <button class="empty__reset" onclick={() => selectObject(null)}>Сбросить фильтр</button>
      {/if}
    </div>
  {/if}

  {#if totalPages > 1}
    <div class="pagination">
      <button
        class="page-btn page-btn--nav"
        disabled={page === 0}
        onclick={() => page = 0}
        aria-label="Первая страница"
      >
        <i class="ri-skip-left-line" aria-hidden="true"></i>
      </button>
      <button
        class="page-btn page-btn--nav"
        disabled={page === 0}
        onclick={() => page = Math.max(0, page - 1)}
        aria-label="Предыдущая страница"
      >
        <i class="ri-arrow-left-s-line" aria-hidden="true"></i>
      </button>
      <div class="pagination__pages">
        {#each getPageNumbers() as num}
          {#if num === '...'}
            <span class="pagination__ellipsis">…</span>
          {:else}
            <button
              class="page-btn"
              class:page-btn--active={page === num - 1}
              onclick={() => page = num - 1}
            >
              {num}
            </button>
          {/if}
        {/each}
      </div>
      <button
        class="page-btn page-btn--nav"
        disabled={page >= totalPages - 1}
        onclick={() => page = Math.min(totalPages - 1, page + 1)}
        aria-label="Следующая страница"
      >
        <i class="ri-arrow-right-s-line" aria-hidden="true"></i>
      </button>
      <button
        class="page-btn page-btn--nav"
        disabled={page >= totalPages - 1}
        onclick={() => page = totalPages - 1}
        aria-label="Последняя страница"
      >
        <i class="ri-skip-right-line" aria-hidden="true"></i>
      </button>
      <span class="pagination__info">
        {filteredData.length === 0
          ? '0 из 0'
          : `${page * pageLim + 1}–${Math.min((page + 1) * pageLim, filteredData.length)} из ${filteredData.length}`}
      </span>
    </div>
  {/if}
</section>

{#if showDeleteModal}
  <DeleteModal
    onConfirm={handleDelete}
    onCancel={() => { showDeleteModal = false; deleteId = null; }}
  />
{/if}

<style>
  .reports-section {
    width: 100%;
    padding: 1.5rem;
  }

  .reports-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 1.25rem;
  }

  .reports-title {
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .reports-title i {
    color: var(--accent-light);
    font-size: 1.25rem;
  }

  .reports-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.6rem;
    height: 1.6rem;
    padding: 0 0.45rem;
    border-radius: 999px;
    background: var(--accent-soft);
    border: 1px solid rgba(143, 168, 84, 0.4);
    color: var(--accent-bright);
    font-size: 0.78rem;
    font-weight: 700;
  }

  .dropdown-wrapper {
    position: relative;
    display: inline-block;
  }

  .dropdown-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
    min-height: 40px;
  }

  .dropdown-btn--active {
    border-color: var(--accent-light);
    color: var(--accent-bright);
  }

  .dropdown-menu {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    z-index: 50;
    min-width: 220px;
    max-width: 320px;
    max-height: 400px;
    padding: 0;
    display: flex;
    flex-direction: column;
    background: var(--surface-elevated);
    overflow: hidden;
    animation: scaleIn 0.18s ease-out;
    transform-origin: top right;
  }

  .dropdown-search {
    padding: 0.5rem;
    border-bottom: 1px solid var(--glass-border);
    flex-shrink: 0;
  }

  .dropdown-search__input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
    min-height: 40px;
  }

  .dropdown-list {
    overflow-y: auto;
    max-height: 340px;
    padding: 0.25rem 0;
  }

  .dropdown-item {
    background: none;
    border: none;
    color: var(--text-secondary);
    padding: 0.6rem 1rem;
    min-height: 42px;
    text-align: left;
    font-family: inherit;
    font-size: 0.85rem;
    cursor: pointer;
    transition: var(--transition);
    display: block;
    width: 100%;
  }

  .dropdown-item:hover {
    background: var(--glass-bg-hover);
    color: var(--text-primary);
  }

  .dropdown-item--selected {
    color: var(--accent-bright);
    font-weight: 700;
  }

  .dropdown-item--empty {
    cursor: default;
    color: var(--text-muted);
    font-style: italic;
  }

  .dropdown-item--empty:hover {
    background: transparent;
  }

  .table-wrapper {
    width: 100%;
    overflow-x: auto;
  }

  .table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 0.85rem;
  }

  .table th {
    color: var(--text-muted);
    font-weight: 600;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 0.75rem;
    border-bottom: 1px solid var(--glass-border);
    text-align: left;
    vertical-align: top;
    white-space: nowrap;
  }

  .table td {
    padding: 0.65rem 0.75rem;
    border-bottom: 1px solid var(--line-soft);
    color: var(--text-secondary);
    vertical-align: middle;
  }

  .table tr:hover td {
    background: var(--glass-bg);
  }

  .table__date {
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  .table__actions-col {
    text-align: right;
  }

  .chip {
    display: inline-block;
    padding: 0.15rem 0.55rem;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 700;
    white-space: nowrap;
  }

  .chip--obj {
    background: var(--accent-soft);
    color: var(--accent-bright);
    border: 1px solid rgba(143, 168, 84, 0.35);
  }

  .chip--type {
    background: var(--gold-soft);
    color: var(--gold);
    border: 1px solid rgba(211, 164, 98, 0.35);
  }

  .data-row {
    font-size: 0.8rem;
    color: var(--text-secondary);
  }

  .data-row__key {
    color: var(--text-muted);
  }

  .actions {
    display: flex;
    gap: 0.3rem;
    justify-content: flex-end;
  }

  .action-btn {
    background: none;
    border: 1px solid transparent;
    cursor: pointer;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    color: var(--text-muted);
    transition: var(--transition);
    border-radius: var(--radius-sm);
    -webkit-tap-highlight-color: transparent;
  }

  .action-btn--edit:hover {
    color: var(--accent-bright);
    background: var(--accent-soft);
    border-color: rgba(143, 168, 84, 0.35);
  }

  .action-btn--download:hover {
    color: var(--gold);
    background: var(--gold-soft);
    border-color: rgba(211, 164, 98, 0.35);
  }

  .action-btn--delete:hover {
    color: var(--danger);
    background: var(--danger-soft);
    border-color: rgba(217, 83, 79, 0.35);
  }

  /* ── Мобильные карточки ─────────────────────────── */
  .cards {
    display: none;
    flex-direction: column;
    gap: 0.75rem;
  }

  .card {
    background: var(--surface-elevated);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-sm);
    padding: 0.9rem;
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }

  .card__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .card__ids {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    flex-wrap: wrap;
  }

  .card__lab {
    font-weight: 700;
    color: var(--text-primary);
    font-size: 0.9rem;
  }

  .card__date {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.78rem;
    color: var(--text-muted);
    white-space: nowrap;
  }

  .card__data {
    border-top: 1px solid var(--line-soft);
    padding-top: 0.6rem;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .card__actions {
    display: flex;
    gap: 0.5rem;
  }

  .card-btn {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    min-height: 42px;
    border-radius: var(--radius-sm);
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    color: var(--text-secondary);
    font-family: inherit;
    font-size: 0.82rem;
    font-weight: 600;
    transition: var(--transition);
    -webkit-tap-highlight-color: transparent;
  }

  .card-btn:active {
    background: var(--glass-bg-hover);
    transform: scale(0.98);
  }

  .card-btn--danger {
    color: var(--danger);
    border-color: rgba(217, 83, 79, 0.3);
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    text-align: center;
    color: var(--text-muted);
    padding: 2.5rem 1rem;
  }

  .empty i {
    font-size: 2.2rem;
    opacity: 0.6;
  }

  .empty__reset {
    background: none;
    border: none;
    color: var(--accent-light);
    font-family: inherit;
    font-size: 0.85rem;
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }

  .pagination {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin-top: 1.25rem;
    flex-wrap: wrap;
  }

  .pagination__pages {
    display: flex;
    gap: 0.2rem;
    align-items: center;
  }

  .pagination__ellipsis {
    color: var(--text-muted);
    font-size: 0.85rem;
    padding: 0 0.2rem;
  }

  .pagination__info {
    margin-left: auto;
    font-size: 0.8rem;
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
  }

  .page-btn {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    color: var(--text-secondary);
    min-width: 38px;
    height: 38px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 0.5rem;
    border-radius: var(--radius-sm);
    font-family: inherit;
    font-size: 0.82rem;
    cursor: pointer;
    transition: var(--transition);
    -webkit-tap-highlight-color: transparent;
  }

  .page-btn:hover:not(:disabled) {
    background: var(--glass-bg-hover);
  }

  .page-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .page-btn--active {
    background: var(--accent);
    border-color: var(--accent);
    color: white;
    box-shadow: 0 2px 10px var(--accent-glow);
  }

  @media screen and (max-width: 768px) {
    .reports-section {
      padding: 1.25rem 1rem;
    }

    .table-wrapper {
      display: none;
    }

    .cards {
      display: flex;
    }

    .reports-head {
      flex-direction: column;
      align-items: stretch;
    }

    .dropdown-btn {
      width: 100%;
      justify-content: space-between;
    }

    .dropdown-menu {
      left: 0;
      right: 0;
      max-width: none;
    }

    .pagination {
      justify-content: center;
    }

    .pagination__info {
      width: 100%;
      text-align: center;
      margin-left: 0;
      margin-top: 0.35rem;
    }

    .page-btn {
      min-width: 42px;
      height: 42px;
    }
  }
</style>
