<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { get as apiGet } from '$lib/api.js';
  import Loader from '$lib/components/Loader.svelte';

  let reportId = $derived($page.params.id);
  let report = $state(null);
  let additional = $state(null);
  let notes = $state(null);
  let loading = $state(true);

  onMount(async () => {
    if (!reportId) { loading = false; return; }

    await Promise.all([
      fetchReport(),
      fetchAdditional(),
      fetchNotes()
    ]);

    loading = false;
  });

  async function fetchReport() {
    try {
      const res = await apiGet(`/reports/?id=${reportId}`);
      if (res.ok) report = await res.json();
    } catch {}
  }

  async function fetchAdditional() {
    try {
      const res = await apiGet(`/files/?report_id=${reportId}`);
      if (res.ok) additional = await res.json();
    } catch {}
  }

  async function fetchNotes() {
    try {
      const res = await apiGet(`/test_type_files/${reportId}`);
      if (res.ok) notes = await res.json();
    } catch {}
  }

  function formatDateTime(dt) {
    if (!dt) return '';
    const d = new Date(dt);
    if (isNaN(d)) return dt;
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(d);
  }

  function downloadBlob(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function downloadFile(link, filename) {
    try {
      const res = await apiGet(`/s3/?key=${link}`);
      if (res.ok) {
        const blob = await res.blob();
        const fullName = report
          ? `${report.object_number} - ${report.laboratory_number} - ${report.test_type} ${filename}`
          : filename;
        downloadBlob(blob, fullName);
      }
    } catch {}
  }

  function isImage(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    return ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext);
  }
</script>

<svelte:head>
  <title>Протокол — GEOREPORT</title>
</svelte:head>

{#if loading}
  <Loader />
{:else if report}
  <div class="report">
    <div class="report__verified fade-in" role="status">
      <i class="ri-shield-check-fill" aria-hidden="true"></i>
      <div class="report__verified-text">
        <strong>Протокол подтверждён</strong>
        <span>Данные зарегистрированы на сервере GEOREPORT и защищены от изменений</span>
      </div>
    </div>

    <div class="report__card glass fade-in" style="animation-delay: 0.1s">
      <div class="report__header">
        <div class="report__header-icon" aria-hidden="true">
          <i class="ri-flask-line"></i>
        </div>
        <div class="report__header-info">
          <h1 class="report__header-title">МОСТДОРГЕОТРЕСТ</h1>
          <a href="https://mdgt.ru/" target="_blank" rel="noreferrer" class="report__header-url">mdgt.ru</a>
        </div>
      </div>

      <table class="report__table">
        <tbody>
          <tr>
            <td class="report__label">Номер объекта</td>
            <td>{report.object_number}</td>
          </tr>
          <tr>
            <td class="report__label">Лабораторный номер</td>
            <td>{report.laboratory_number}</td>
          </tr>
          <tr>
            <td class="report__label">Дата выдачи протокола</td>
            <td>{formatDateTime(report.datetime)}</td>
          </tr>
          <tr>
            <td class="report__label">Тип опыта</td>
            <td>{report.test_type}</td>
          </tr>
          {#each Object.entries(report.data || {}) as [key, value]}
            <tr>
              <td class="report__label">{key}</td>
              <td>{value}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    {#if additional && additional.length > 0}
      <div class="report__card glass fade-in" style="animation-delay: 0.2s">
        <h2 class="report__section-title">
          <i class="ri-attachment-2" aria-hidden="true"></i>
          Дополнительные файлы
        </h2>
        <div class="report__files">
          {#each additional as file}
            <div class="report__file">
              <button
                type="button"
                class="report__file-link"
                onclick={() => downloadFile(file.link, file.filename)}
              >
                <i class="ri-download-2-line" aria-hidden="true"></i>
                {file.filename}
              </button>
              {#if isImage(file.filename)}
                <img src="/s3/?key={file.link}" alt="" class="report__file-preview" loading="lazy" />
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if notes && notes.length > 0}
      <div class="report__card glass fade-in" style="animation-delay: 0.3s">
        <h2 class="report__section-title">
          <i class="ri-book-open-line" aria-hidden="true"></i>
          Справочные файлы
        </h2>
        <div class="report__files">
          {#each notes as file}
            <div class="report__file">
              <button
                type="button"
                class="report__file-link"
                onclick={() => downloadFile(file.link, file.filename)}
              >
                <i class="ri-download-2-line" aria-hidden="true"></i>
                {file.filename}
              </button>
              {#if isImage(file.filename)}
                <img src="/s3/?key={file.link}" alt="" class="report__file-preview" loading="lazy" />
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <p class="report__footer-note fade-in" style="animation-delay: 0.35s">
      <i class="ri-qr-code-line" aria-hidden="true"></i>
      Проверено через сервис GEOREPORT
    </p>
  </div>
{:else}
  <div class="report__empty glass fade-in">
    <i class="ri-file-damage-line" aria-hidden="true"></i>
    <h1 class="report__empty-title">Протокол не найден</h1>
    <p>Данные по этому отчёту отсутствуют на сервере. Проверьте корректность QR-кода.</p>
    <a href="/" class="btn btn-glass report__empty-btn">На главную</a>
  </div>
{/if}

<style>
  .report {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    width: 100%;
    max-width: 700px;
    margin: 0 auto;
  }

  .report__verified {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    padding: 1rem 1.25rem;
    border-radius: var(--radius-md);
    background: var(--accent-soft);
    border: 1px solid rgba(143, 168, 84, 0.45);
  }

  .report__verified i {
    font-size: 1.9rem;
    color: var(--accent-bright);
    flex-shrink: 0;
  }

  .report__verified-text {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  .report__verified-text strong {
    color: var(--text-primary);
    font-size: 0.98rem;
  }

  .report__verified-text span {
    color: var(--text-secondary);
    font-size: 0.82rem;
    line-height: 1.45;
  }

  .report__card {
    padding: 0;
    overflow: hidden;
  }

  .report__header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 1.4rem 1.5rem;
    border-bottom: 1px solid var(--glass-border);
    background: rgba(255, 255, 255, 0.02);
  }

  .report__header-icon {
    width: 54px;
    height: 54px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--accent-soft);
    border: 1px solid rgba(143, 168, 84, 0.4);
    color: var(--accent-bright);
    font-size: 1.6rem;
    flex-shrink: 0;
  }

  .report__header-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .report__header-title {
    font-size: 1.25rem;
    color: var(--text-primary);
    letter-spacing: 0.04em;
  }

  .report__header-url {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .report__header-url:hover {
    color: var(--accent-light);
  }

  .report__table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  .report__table td {
    padding: 0.65rem 1.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    color: var(--text-primary);
  }

  .report__table tr:nth-child(even) td {
    background: rgba(255, 255, 255, 0.02);
  }

  .report__table tr:last-child td {
    border-bottom: none;
  }

  .report__label {
    color: var(--text-muted);
    font-weight: 600;
    white-space: nowrap;
    border-right: 1px solid rgba(255, 255, 255, 0.06);
    width: 42%;
  }

  .report__section-title {
    font-size: 1rem;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--glass-border);
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .report__section-title i {
    color: var(--accent-light);
  }

  .report__files {
    padding: 0.5rem;
  }

  .report__file {
    padding: 0.5rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }

  .report__file:last-child {
    border-bottom: none;
  }

  .report__file-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--text-secondary);
    font-family: inherit;
    font-size: 0.9rem;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
    padding: 0.4rem 0;
    min-height: 40px;
    transition: var(--transition);
    text-align: left;
  }

  .report__file-link i {
    color: var(--accent-light);
    font-size: 1.05rem;
  }

  .report__file-link:hover {
    color: var(--accent-bright);
  }

  .report__file-preview {
    display: block;
    margin-top: 0.5rem;
    max-width: 100%;
    max-height: 300px;
    border-radius: var(--radius-sm);
  }

  .report__footer-note {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .report__footer-note i {
    color: var(--accent-light);
    font-size: 1rem;
  }

  .report__empty {
    padding: 3rem 1.5rem;
    text-align: center;
    color: var(--text-secondary);
    max-width: 480px;
    margin: 2rem auto 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .report__empty i {
    font-size: 2.6rem;
    color: var(--text-muted);
  }

  .report__empty-title {
    font-size: 1.25rem;
  }

  .report__empty-btn {
    margin-top: 0.5rem;
    text-decoration: none;
  }

  @media screen and (max-width: 500px) {
    .report__header {
      flex-direction: column;
      text-align: center;
      gap: 0.6rem;
      padding: 1.25rem 1rem;
    }

    .report__header-info {
      align-items: center;
    }

    .report__table td {
      padding: 0.6rem 1rem;
    }

    .report__label {
      width: auto;
    }
  }
</style>
