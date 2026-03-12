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

{#if loading}
  <Loader />
{:else if report}
  <div class="report">
    <div class="report__card glass fade-in">
      <div class="report__header">
        <img src="/images/lock.gif" alt="lock" class="report__header-icon" />
        <div class="report__header-info">
          <h2 class="report__header-title">МОСТДОРГЕОТРЕСТ</h2>
          <a href="https://mdgt.ru/" target="_blank" class="report__header-url">mdgt.ru</a>
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
            <td>{new Date(report.datetime).toLocaleString()}</td>
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
      <div class="report__card glass fade-in" style="animation-delay: 0.15s">
        <h3 class="report__section-title">Дополнительные файлы</h3>
        <div class="report__files">
          {#each additional as file}
            <div class="report__file">
              <a
                href="#download"
                class="report__file-link"
                onclick={(e) => { e.preventDefault(); downloadFile(file.link, file.filename); }}
              >
                {file.filename}
              </a>
              {#if isImage(file.filename)}
                <img src="/s3/?key={file.link}" alt="" class="report__file-preview" />
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if notes && notes.length > 0}
      <div class="report__card glass fade-in" style="animation-delay: 0.3s">
        <h3 class="report__section-title">Справочные файлы</h3>
        <div class="report__files">
          {#each notes as file}
            <div class="report__file">
              <a
                href="#download"
                class="report__file-link"
                onclick={(e) => { e.preventDefault(); downloadFile(file.link, file.filename); }}
              >
                {file.filename}
              </a>
              {#if isImage(file.filename)}
                <img src="/s3/?key={file.link}" alt="" class="report__file-preview" />
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{:else}
  <div class="report__empty glass fade-in">
    <p>Данные по отчету не найдены.</p>
  </div>
{/if}

<style>
  .report {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
    max-width: 700px;
    margin: 0 auto;
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
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--glass-border);
  }

  .report__header-icon {
    width: 60px;
    height: 60px;
  }

  .report__header-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .report__header-title {
    font-size: 1.3rem;
    color: var(--text-primary);
    border-bottom: 1px solid var(--glass-border);
    padding-bottom: 0.2rem;
  }

  .report__header-url {
    font-size: 0.9rem;
    color: var(--text-muted);
    margin-top: 0.2rem;
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
    padding: 0.6rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    color: var(--text-secondary);
  }

  .report__table tr:last-child td {
    border-bottom: none;
  }

  .report__label {
    color: var(--text-muted);
    font-weight: 600;
    white-space: nowrap;
    border-right: 1px solid rgba(255, 255, 255, 0.06);
    width: 40%;
  }

  .report__section-title {
    font-size: 1rem;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--glass-border);
    color: var(--text-secondary);
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
    color: var(--text-secondary);
    text-decoration: underline;
    font-size: 0.9rem;
  }

  .report__file-link:hover {
    color: var(--accent-light);
  }

  .report__file-preview {
    display: block;
    margin-top: 0.5rem;
    max-width: 100%;
    max-height: 300px;
    border-radius: var(--radius-sm);
  }

  .report__empty {
    padding: 3rem;
    text-align: center;
    color: var(--text-muted);
  }

  @media screen and (max-width: 500px) {
    .report__header {
      flex-direction: column;
      text-align: center;
      gap: 0.5rem;
    }

    .report__header-icon {
      width: 45px;
      height: 45px;
    }

    .report__label {
      width: auto;
    }
  }
</style>
