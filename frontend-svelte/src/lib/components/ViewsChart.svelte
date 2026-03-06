<script>
  import { onMount, onDestroy } from 'svelte';

  let { dataset } = $props();
  let canvas;
  let chart;
  let error = $state(false);

  onMount(async () => {
    try {
      const ChartJS = await import('chart.js');
      const {
        Chart,
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend,
        Filler
      } = ChartJS;

      Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(115, 137, 61, 0.4)');
      gradient.addColorStop(1, 'rgba(115, 137, 61, 0)');

      const maxVal = dataset.views.length > 0 ? Math.max(...dataset.views, 10) : 10;

      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: dataset.dates,
          datasets: [{
            label: 'Просмотры',
            data: dataset.views,
            borderColor: '#8fa854',
            backgroundColor: gradient,
            fill: true,
            cubicInterpolationMode: 'monotone',
            tension: 0.4,
            pointBackgroundColor: '#8fa854',
            pointBorderColor: 'rgba(255,255,255,0.3)',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: { display: false },
            tooltip: {
              backgroundColor: 'rgba(10, 31, 10, 0.9)',
              titleColor: 'rgba(255,255,255,0.9)',
              bodyColor: 'rgba(255,255,255,0.7)',
              borderColor: 'rgba(255,255,255,0.1)',
              borderWidth: 1,
              padding: 10,
              cornerRadius: 8,
            }
          },
          interaction: { intersect: false },
          scales: {
            x: {
              ticks: {
                color: 'rgba(255,255,255,0.5)',
                font: { size: 12 }
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
                font: { size: 12 }
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
  <h3 class="chart-title">Статистика просмотров</h3>
  {#if error}
    <p class="chart-error">Не удалось загрузить график</p>
  {:else}
    <div class="chart-container">
      <canvas bind:this={canvas}></canvas>
    </div>
  {/if}
</div>

<style>
  .chart-wrapper {
    padding: 1.5rem;
    width: 100%;
  }

  .chart-title {
    font-size: 1rem;
    color: var(--text-secondary);
    margin-bottom: 1rem;
    text-align: center;
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
</style>
