<script>
  const steps = [
    {
      color: '#897460',
      soft: 'rgba(137, 116, 96, 0.16)',
      title: 'Данные — на сервере',
      text: 'Результаты испытания из протокола загружаются на сервер и хранятся под своим уникальным ключом, исключающим несанкционированный доступ.',
      icon: 'ri-lock-2-line'
    },
    {
      color: '#d3a462',
      soft: 'rgba(211, 164, 98, 0.16)',
      title: 'Сервер генерирует QR-код',
      text: 'Сервер генерирует специальный QR-код, содержащий ссылку для просмотра данных протокола.',
      icon: 'ri-qr-code-line'
    },
    {
      color: '#8fa854',
      soft: 'rgba(143, 168, 84, 0.16)',
      title: 'QR-код — на протоколе',
      text: 'QR-код помещается на протокол испытаний, тем самым исключая возможность редактирования данных в протоколе после его выдачи.',
      icon: 'ri-file-shield-2-line'
    }
  ];
</script>

<div class="infographic">
  {#each steps as step, i}
    <div class="step fade-in" style="animation-delay: {i * 0.15}s">
      <div class="step__marker" aria-hidden="true">
        <span class="step__num" style="border-color: {step.color}; color: {step.color}">{i + 1}</span>
        {#if i < steps.length - 1}
          <div class="step__line"></div>
        {/if}
      </div>
      <div class="step__card glass" style="--step-color: {step.color}">
        <div class="step__icon-box" style="background: {step.soft}; color: {step.color}">
          <i class={step.icon}></i>
        </div>
        <div class="step__body">
          <h3 class="step__title">{step.title}</h3>
          <p class="step__text">{step.text}</p>
        </div>
      </div>
    </div>
  {/each}
</div>

<style>
  .infographic {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    width: 100%;
  }

  .step {
    display: flex;
    align-items: stretch;
    gap: 1rem;
    opacity: 0;
    animation: fadeIn 0.6s ease-out forwards;
  }

  .step__marker {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 34px;
    padding-top: 1.35rem;
  }

  .step__num {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 2px solid;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.95rem;
    background: var(--surface-elevated);
    flex-shrink: 0;
  }

  .step__line {
    width: 2px;
    flex: 1;
    min-height: 40px;
    background: linear-gradient(to bottom, var(--text-muted), transparent);
    margin-top: 0.5rem;
  }

  .step__card {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 1.15rem;
    padding: 1.25rem 1.4rem;
    border-left: 3px solid var(--step-color);
  }

  .step__card:hover {
    transform: translateX(4px);
  }

  .step__icon-box {
    width: 58px;
    min-width: 58px;
    height: 58px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.7rem;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  .step__body {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .step__title {
    font-size: 0.98rem;
    color: var(--text-primary);
  }

  .step__text {
    font-size: 0.88rem;
    color: var(--text-secondary);
    line-height: 1.55;
  }

  @media screen and (max-width: 500px) {
    .step__marker {
      display: none;
    }

    .step__card {
      flex-direction: row;
      align-items: flex-start;
      padding: 1.1rem;
    }

    .step__icon-box {
      width: 46px;
      min-width: 46px;
      height: 46px;
      font-size: 1.35rem;
    }

    .step__text {
      font-size: 0.84rem;
    }
  }
</style>
