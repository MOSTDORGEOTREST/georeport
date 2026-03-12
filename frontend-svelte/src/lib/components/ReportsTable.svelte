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
      const res = await post(`/reports/qr?id=${report.id}`, null, false);
      if (res.ok) {
        const blob = await res.blob();
        downloadBlob(blob, `${report.object_number} - ${report.laboratory_number} - ${report.test_type}`);
      }
    } catch {
      addToast('Ошибка загрузки QR', 'error');
    }
  }

  function confirmDelete(id) {
    deleteId = id;
    showDeleteModal = true;
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await del(`/reports/?id=${deleteId}`);
      showDeleteModal = false;
      deleteId = null;
      onfetchObjects?.();
    } catch {
      addToast('Ошибка удаления', 'error');
    }
  }
</script>

<section class="reports-section">
  <h2 class="reports-title">Выданные протоколы</h2>

  <div class="dropdown-wrapper" bind:this={dropdownWrapper}>
    <button class="btn btn-glass dropdown-btn" onclick={() => showDropdown = !showDropdown}>
      {selectedObj || 'Все объекты'}
      <i class="ri-arrow-down-s-line"></i>
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
        <div class="dropdown-list">
          <button class="dropdown-item" onclick={() => selectObject(null)}>Все объекты</button>
          {#each filteredObjects as obj}
            <button class="dropdown-item" onclick={() => selectObject(obj)}>{obj}</button>
          {/each}
          {#if objects.length > 10 && filteredObjects.length === 0}
            <div class="dropdown-item dropdown-item--empty">Ничего не найдено</div>
          {/if}
        </div>
      </div>
    {/if}
  </div>

  <div class="table-wrapper">
    <table class="table">
      <thead>
        <tr>
          <th>Дата выдачи</th>
          <th>Объект</th>
          <th>Лаб. номер</th>
          <th>Тип испытания</th>
          <th>Информация</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        {#each pageData as report}
          <tr>
            <td>{report.datetime?.split('T')[0] || ''}</td>
            <td>{report.object_number}</td>
            <td>{report.laboratory_number}</td>
            <td>{report.test_type}</td>
            <td>
              {#each Object.entries(report.data || {}) as [key, val]}
                <div class="data-row">{key}: {val}</div>
              {/each}
            </td>
            <td>
              <div class="actions">
                <button
                  class="action-btn"
                  title="Обновить"
                  onclick={() => onUpdateReport?.(report)}
                >
                  <img src="/images/update.png" alt="update" width="24" height="24" />
                </button>
                <button
                  class="action-btn"
                  title="Удалить"
                  onclick={() => confirmDelete(report.id)}
                >
                  <img src="/images/trash.png" alt="delete" width="24" height="24" />
                </button>
                <button
                  class="action-btn"
                  title="Скачать QR"
                  onclick={() => downloadQr(report)}
                >
                  <img src="/images/download.png" alt="download" width="24" height="24" />
                </button>
              </div>
            </td>
          </tr>
        {/each}
        {#if pageData.length === 0}
          <tr><td colspan="6" class="empty">Нет данных</td></tr>
        {/if}
      </tbody>
    </table>
  </div>

  {#if totalPages > 1}
    <div class="pagination">
      <button
        class="page-btn page-btn--nav"
        disabled={page === 0}
        onclick={() => page = 0}
        title="Первая"
      >
        ‹‹
      </button>
      <button
        class="page-btn page-btn--nav"
        disabled={page === 0}
        onclick={() => page = Math.max(0, page - 1)}
        title="Назад"
      >
        ‹
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
        title="Вперёд"
      >
        ›
      </button>
      <button
        class="page-btn page-btn--nav"
        disabled={page >= totalPages - 1}
        onclick={() => page = totalPages - 1}
        title="Последняя"
      >
        ››
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
  }

  .reports-title {
    font-size: 1.2rem;
    margin-bottom: 1rem;
    text-align: center;
  }

  .dropdown-wrapper {
    position: relative;
    display: inline-block;
    margin-bottom: 1rem;
  }

  .dropdown-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 50;
    min-width: 220px;
    max-width: 320px;
    max-height: 400px;
    padding: 0;
    display: flex;
    flex-direction: column;
    background: rgba(10, 31, 10, 0.95);
    overflow: hidden;
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
    padding: 0.5rem 1rem;
    text-align: left;
    font-family: inherit;
    font-size: 0.85rem;
    cursor: pointer;
    transition: var(--transition);
  }

  .dropdown-item:hover {
    background: var(--glass-bg-hover);
    color: var(--text-primary);
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
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0.75rem;
    border-bottom: 1px solid var(--glass-border);
    text-align: left;
    vertical-align: top;
    white-space: nowrap;
  }

  .table td {
    padding: 0.6rem 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    color: var(--text-secondary);
    vertical-align: top;
  }

  .table tr:hover td {
    background: var(--glass-bg);
  }

  .data-row {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .actions {
    display: flex;
    gap: 0.25rem;
  }

  .action-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    opacity: 0.6;
    transition: var(--transition);
    border-radius: 4px;
  }

  .action-btn:hover {
    opacity: 1;
    background: var(--glass-bg);
  }

  .action-btn img {
    filter: brightness(0) invert(1);
    opacity: 0.7;
  }

  .empty {
    text-align: center;
    color: var(--text-muted);
    padding: 2rem !important;
  }

  .pagination {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin-top: 1rem;
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
    margin-left: 0.5rem;
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .page-btn {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    color: var(--text-secondary);
    padding: 0.4rem 0.7rem;
    border-radius: var(--radius-sm);
    font-family: inherit;
    font-size: 0.8rem;
    cursor: pointer;
    transition: var(--transition);
  }

  .page-btn:hover:not(:disabled) {
    background: var(--glass-bg-hover);
  }

  .page-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .page-btn--nav {
    padding: 0.4rem 0.5rem;
    min-width: 2rem;
  }

  .page-btn--active {
    background: var(--accent);
    border-color: var(--accent);
    color: white;
  }
</style>
