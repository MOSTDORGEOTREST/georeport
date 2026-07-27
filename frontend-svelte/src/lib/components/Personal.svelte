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
  let reportsCount = $state(null);
  let objects = $state([]);
  let objectsData = $state([]);
  let views = $state({ views: [], dates: [] });
  let chartLoaded = $state(false);
  let showTokenModal = $state(false);
  let tokenMessage = $state('');
  let updateData = $state(null);

  let issued = $derived(reportsCount ?? null);
  let remaining = $derived(
    userData && reportsCount !== null ? userData.limit - reportsCount : null
  );
  let usagePercent = $derived(
    userData && reportsCount !== null && userData.limit > 0
      ? Math.min(100, Math.round((reportsCount / userData.limit) * 100))
      : 0
  );

  function parseViews(data) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const entries = Object.entries(data || {})
      .map(([date, count]) => ({ date: new Date(date), count }))
      .filter(item => !Number.isNaN(item.date.getTime()))
      .sort((a, b) => a.date - b.date);

    return {
      views: entries.map(item => item.count),
      dates: entries.map(item =>
        new Intl.DateTimeFormat('ru-RU', options)
          .format(item.date)
          .replace(' г.', '')
      )
    };
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
      const res = await apiGet('/reports/my-count/');
      if (res.ok) {
        const data = await res.json();
        reportsCount = data.count;
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
        const res = await apiGet(`/reports/objects/${encodeURIComponent(obj)}/`);
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
    <div class="personal__head fade-in">
      <div class="personal__greeting">
        <h1 class="personal__title">Личный кабинет</h1>
        <p class="personal__user">
          <i class="ri-user-3-line" aria-hidden="true"></i>
          {userData.username}
        </p>
      </div>
      <div class="personal__license glass">
        <div class="personal__license-badge">
          <i class="ri-vip-crown-2-line" aria-hidden="true"></i>
          {userData.license_level}
        </div>
        <span class="personal__license-date">
          лицензия до {userData.license_end_date}
        </span>
      </div>
    </div>

    <div class="stats fade-in">
      <div class="stat glass">
        <div class="stat__icon stat__icon--accent" aria-hidden="true">
          <i class="ri-stack-line"></i>
        </div>
        <div class="stat__body">
          <span class="stat__value">{userData.limit}</span>
          <span class="stat__label">Лимит протоколов</span>
        </div>
      </div>

      <div class="stat glass">
        <div class="stat__icon stat__icon--gold" aria-hidden="true">
          <i class="ri-file-check-line"></i>
        </div>
        <div class="stat__body">
          <span class="stat__value">{issued ?? '—'}</span>
          <span class="stat__label">Выдано</span>
        </div>
      </div>

      <div class="stat glass">
        <div class="stat__icon stat__icon--accent" aria-hidden="true">
          <i class="ri-battery-charge-line"></i>
        </div>
        <div class="stat__body">
          <span class="stat__value">{remaining ?? '—'}</span>
          <span class="stat__label">Остаток</span>
        </div>
      </div>

      <div class="stat stat--progress glass">
        <div class="stat__progress-head">
          <span class="stat__label">Использовано лимита</span>
          <span class="stat__percent">{usagePercent}%</span>
        </div>
        <div class="stat__bar" role="progressbar" aria-valuenow={usagePercent} aria-valuemin="0" aria-valuemax="100">
          <div class="stat__bar-fill" style="width: {usagePercent}%"></div>
        </div>
      </div>
    </div>
  {/if}

  <div class="token-section glass fade-in">
    <div class="token-section__info">
      <div class="token-section__icon" aria-hidden="true">
        <i class="ri-key-2-line"></i>
      </div>
      <div>
        <h3 class="token-section__title">API-доступ</h3>
        <p class="token-section__desc">
          Токен для интеграции GEOREPORT с вашими системами.
          <a href="#api" class="token-link">Инструкция к API</a>
        </p>
      </div>
    </div>
    <button class="btn btn-accent token-btn" onclick={requestToken}>
      <i class="ri-key-line" aria-hidden="true"></i>
      Получить токен
    </button>
  </div>

  <ReportForm onfetchObjects={fetchObjects} {updateData} onCancelUpdate={() => updateData = null} />

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

  .personal__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .personal__title {
    font-size: 1.6rem;
  }

  .personal__user {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .personal__user i {
    color: var(--accent-light);
  }

  .personal__license {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.3rem;
    padding: 0.75rem 1.1rem;
  }

  .personal__license-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.25rem 0.8rem;
    border-radius: 999px;
    background: var(--gold-soft);
    border: 1px solid rgba(211, 164, 98, 0.45);
    color: var(--gold);
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  .personal__license-date {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    padding: 1.1rem 1.25rem;
  }

  .stat__icon {
    width: 48px;
    height: 48px;
    min-width: 48px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
  }

  .stat__icon--accent {
    background: var(--accent-soft);
    color: var(--accent-bright);
  }

  .stat__icon--gold {
    background: var(--gold-soft);
    color: var(--gold);
  }

  .stat__body {
    display: flex;
    flex-direction: column;
  }

  .stat__value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.2;
  }

  .stat__label {
    font-size: 0.78rem;
    color: var(--text-muted);
    font-weight: 600;
  }

  .stat--progress {
    grid-column: 1 / -1;
    flex-direction: column;
    align-items: stretch;
    gap: 0.6rem;
    padding: 1rem 1.25rem;
  }

  .stat__progress-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stat__percent {
    font-weight: 700;
    color: var(--accent-bright);
    font-size: 0.9rem;
  }

  .stat__bar {
    height: 8px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    overflow: hidden;
  }

  .stat__bar-fill {
    height: 100%;
    border-radius: 999px;
    background: var(--accent-gradient);
    box-shadow: 0 0 12px var(--accent-glow);
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .token-section {
    padding: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .token-section__info {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    flex: 1;
    min-width: 240px;
  }

  .token-section__icon {
    width: 48px;
    height: 48px;
    min-width: 48px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    background: var(--accent-soft);
    color: var(--accent-bright);
  }

  .token-section__title {
    font-size: 1rem;
  }

  .token-section__desc {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .token-link {
    color: var(--accent-light);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .token-btn {
    white-space: nowrap;
  }

  @media screen and (max-width: 768px) {
    .personal__head {
      flex-direction: column;
      align-items: flex-start;
    }

    .personal__license {
      align-items: flex-start;
      width: 100%;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }

    .stats {
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }

    .token-section {
      flex-direction: column;
      align-items: stretch;
    }

    .token-btn {
      width: 100%;
    }
  }
</style>
