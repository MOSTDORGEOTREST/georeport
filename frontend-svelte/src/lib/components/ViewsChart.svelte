<script>
  import { onMount, onDestroy } from 'svelte';

  let { dataset } = $props();
  let canvas = $state();
  let chart;
  let error = $state(false);

  let totalViews = $derived(
    (dataset?.views || []).reduce((sum, v) => sum + (Number(v) || 0), 0)
  );

  onMount(async () => {
    try {
      const ChartJS = await import('chart.js');
      const {
        Chart,
        LineController,
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend,
        Filler
      } = ChartJS;

      // ВАЖНО: LineController обязателен, иначе Chart.js падает
      // с ошибкой «"line" is not a registered controller»
      Chart.register(LineController, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

      if (!canvas) return;

      // Chart.js мутирует переданные массивы — снимаем данные
      // с реактивного $state-прокси, иначе Svelte 5 бросает
      // state_descriptors_fixed
      const ds = {
        views: [...(dataset?.views || [])],
        dates: [...(dataset?.dates || [])]
      };

      const ctx = canvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(143, 168, 84, 0.35)');
      gradient.addColorStop(1, 'rgba(143, 168, 84, 0)');

      const maxVal = ds.views.length > 0 ? Math.max(...ds.views, 10) : 10;

      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ds.dates,
          datasets: [{
            label: 'Просмотры',
            data: ds.views,
            borderColor: '#8fa854',
            borderWidth: 2.5,
            backgroundColor: gradient,
            fill: true,
            cubicInterpolationMode: 'monotone',
            tension: 0.4,
            pointBackgroundColor: '#a8c46a',
            pointBorderColor: 'rgba(10, 31, 10, 0.8)',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointHoverBackgroundColor: '#d3a462',
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: { display: false },
            tooltip: {
              backgroundColor: 'rgba(10, 31, 10, 0.92)',
              titleColor: 'rgba(255,255,255,0.9)',
              bodyColor: 'rgba(255,255,255,0.7)',
              borderColor: 'rgba(255,255,255,0.12)',
              borderWidth: 1,
              padding: 10,
              cornerRadius: 8,
              displayColors: false,
            }
          },
          interaction: { intersect: false, mode: 'index' },
          scales: {
            x: {
              ticks: {
                color: 'rgba(255,255,255,0.5)',
                font: { size: 11, family: 'Quicksand' },
                maxRotation: 40,
              },
              grid: {
                color: 'rgba(255,255,255,0.05)',
              }
            },
            y: {
              suggestedMin: 0,
              suggestedMax: maxVal,
              ticks: {
                color: 'rgba(255,255,255,0.5)',
                font: { size: 11, family: 'Quicksand' },
                precision: 0,
              },
              grid: {
                color: 'rgba(255,255,255,0.05)',
              }
            }
          }
        }
      });
    } catch (e) {
      console.error('Chart init error:', e);
      error = true;
    }
  });

  onDestroy(() => {
    if (chart) chart.destroy();
  });
</script>

<div class="chart-wrapper glass">
  <div class="chart-head">
    <h3 class="chart-title">
      <i class="ri-line-chart-line" aria-hidden="true"></i>
      Статистика просмотров
    </h3>
    {#if totalViews > 0}
      <span class="chart-total">
        {totalViews.toLocaleString('ru-RU')} всего
      </span>
    {/if}
  </div>
  {#if error}
    <p class="chart-error">Не удалось загрузить график</p>
  {:else}
    <div class="chart-container">
      <canvas bind:this={canvas} aria-label="График просмотров протоколов по месяцам"></canvas>
    </div>
  {/if}
</div>

<style>
  .chart-wrapper {
    padding: 1.5rem;
    width: 100%;
  }

  .chart-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .chart-title {
    font-size: 1.05rem;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .chart-title i {
    color: var(--accent-light);
    font-size: 1.25rem;
  }

  .chart-total {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--accent-bright);
    background: var(--accent-soft);
    border: 1px solid rgba(143, 168, 84, 0.35);
    border-radius: 999px;
    padding: 0.2rem 0.7rem;
  }

  .chart-container {
    position: relative;
    width: 100%;
    height: 280px;
  }

  .chart-error {
    text-align: center;
    color: var(--text-muted);
    padding: 2rem;
  }

  @media screen and (max-width: 500px) {
    .chart-wrapper {
      padding: 1.25rem 1rem;
    }

    .chart-container {
      height: 220px;
    }
  }
</style>
