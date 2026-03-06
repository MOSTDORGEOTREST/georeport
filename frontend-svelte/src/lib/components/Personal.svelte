<script>
  import { onMount } from 'svelte';
  import { logged } from '$lib/stores.js';
  import { get as apiGet, post } from '$lib/api.js';
  import { addToast } from '$lib/stores.js';
  import ReportForm from './ReportForm.svelte';
  import ReportsTable from './ReportsTable.svelte';
  import TokenModal from './TokenModal.svelte';
  import ViewsChart from './ViewsChart.svelte';

  let userData = $state(null);
  let reportsCount = $state(0);
  let objects = $state([]);
  let objectsData = $state([]);
  let views = $state({ views: [], dates: [] });
  let chartLoaded = $state(false);
  let showTokenModal = $state(false);
  let tokenMessage = $state('');
  let updateData = $state(null);

  function parseViews(data) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const vArr = [];
    const dArr = [];
    const items = Object.keys(data);
    let lastDate = null;

    if (items.length > 0) {
      items.forEach(item => {
        vArr.push(data[item]);
        lastDate = new Date(item);
        const d = new Intl.DateTimeFormat('ru-RU', options)
          .format(new Date(item))
          .replace(' г.', '');
        dArr.push(d);
      });

      const now = new Date();
      if (now.getMonth() > lastDate.getMonth()) {
        vArr.push(0);
        dArr.push(
          new Intl.DateTimeFormat('ru-RU', options).format(now).replace(' г.', '')
        );
      }
      return { views: vArr, dates: dArr };
    }
    return { views: [], dates: [] };
  }

  async function fetchUserData() {
    try {
      const res = await apiGet('/auth/user/');
      if (res.ok) {
        userData = await res.json();
      } else {
        logged.set(false);
      }
    } catch {
      logged.set(false);
    }
  }

  async function fetchReportsCount() {
    try {
      const res = await apiGet('/reports/count/');
      if (res.ok) {
        reportsCount = await res.json();
      }
    } catch {}
  }

  async function fetchObjects() {
    try {
      const res = await apiGet('/reports/objects/');
      if (res.ok) {
        objects = await res.json();
        await fetchAllObjectsData();
      }
    } catch {}
  }

  async function fetchAllObjectsData() {
    try {
      const promises = objects.map(async (obj) => {
        const res = await apiGet(`/reports/objects/${obj}`);
        if (res.ok) return res.json();
        return null;
      });
      const results = await Promise.all(promises);
      objectsData = results.filter(Boolean).flat();
    } catch {}
  }

  async function requestToken() {
    try {
      const res = await post('/auth/token/', null, false);
      if (!res.ok) {
        tokenMessage = 'Получение токена доступно только для лицензии уровня Enterprise';
      } else {
        const data = await res.json();
        await navigator.clipboard.writeText(data.access_token);
        tokenMessage = 'Токен скопирован в буфер обмена';
      }
      showTokenModal = true;
    } catch {
      tokenMessage = 'Ошибка получения токена';
      showTokenModal = true;
    }
  }

  async function fetchViews() {
    try {
      const res = await apiGet('/stat/period_count');
      if (res.ok) {
        const data = await res.json();
        if (data && Object.keys(data).length > 0) {
          views = parseViews(data);
          chartLoaded = true;
        }
      }
    } catch {}
  }

  function handleUpdateReport(report) {
    updateData = {
      id: report.id,
      object_number: report.object_number,
      laboratory_number: report.laboratory_number,
      test_type: report.test_type,
      data: report.data
    };
  }

  onMount(() => {
    fetchUserData();
    fetchReportsCount();
    fetchObjects();
    fetchViews();
  });
</script>

<div class="personal">
  {#if userData}
    <div class="user-info glass">
      <table class="user-table">
        <tbody>
          <tr><td class="user-table__label">Имя пользователя:</td><td>{userData.username}</td></tr>
          <tr><td class="user-table__label">Уровень лицензии:</td><td>{userData.license_level}</td></tr>
          <tr><td class="user-table__label">Дата окончания лицензии:</td><td>{userData.license_end_date}</td></tr>
          <tr><td class="user-table__label">Лимит:</td><td>{userData.limit}</td></tr>
          <tr><td class="user-table__label">Выдано:</td><td>{reportsCount || '-'}</td></tr>
          <tr><td class="user-table__label">Остаток:</td><td>{reportsCount ? userData.limit - reportsCount : '-'}</td></tr>
        </tbody>
      </table>
    </div>
  {/if}

  <div class="token-section glass">
    <button class="btn btn-accent token-btn" onclick={requestToken}>
      Получить токен
    </button>
    <a href="#" class="token-link">Просмотр инструкции к API</a>
  </div>

  <ReportForm onfetchObjects={fetchObjects} {updateData} />

  <ReportsTable
    {objectsData}
    {objects}
    onfetchObjects={fetchObjects}
    onUpdateReport={handleUpdateReport}
  />

  {#if chartLoaded}
    <ViewsChart dataset={views} />
  {/if}
</div>

{#if showTokenModal}
  <TokenModal message={tokenMessage} onClose={() => showTokenModal = false} />
{/if}

<style>
  .personal {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .user-info {
    padding: 1.25rem;
    overflow-x: auto;
  }

  .user-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  .user-table td {
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    color: var(--text-secondary);
  }

  .user-table__label {
    color: var(--text-muted);
    font-weight: 600;
    white-space: nowrap;
  }

  .token-section {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .token-btn {
    width: 100%;
    max-width: 300px;
  }

  .token-link {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .token-link:hover {
    color: var(--accent-light);
  }
</style>
