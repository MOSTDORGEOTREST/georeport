<script>
  const steps = [
    {
      color: '#A26A35',
      soft: 'rgba(162, 106, 53, 0.14)',
      title: 'Данные — на сервере',
      text: 'Результаты испытания загружаются на защищённый сервер и хранятся под уникальным ключом, исключающим несанкционированный доступ.',
      icon: 'ri-lock-2-line'
    },
    {
      color: '#B98A2E',
      soft: 'rgba(221, 181, 106, 0.18)',
      title: 'Сервер генерирует QR-код',
      text: 'Для каждого протокола создаётся уникальный QR-код со ссылкой на зарегистрированные данные испытания.',
      icon: 'ri-qr-code-line'
    },
    {
      color: '#47836E',
      soft: 'rgba(71, 131, 110, 0.14)',
      title: 'QR-код — на протоколе',
      text: 'QR-код помещается на выданный протокол — любое редактирование данных после выдачи становится невозможным.',
      icon: 'ri-file-shield-2-line'
    }
  ];
</script>

<div class="infographic">
  {#each steps as step, i}
    <div class="step fade-in" style="animation-delay: {i * 0.15}s">
      <div class="step__marker" aria-hidden="true">
        <span class="step__num" style="border-color: {step.color}; color: {step.color}">0{i + 1}</span>
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
    gap: 1.1rem;
    opacity: 0;
    animation: fadeIn 0.6s ease-out forwards;
  }

  .step__marker {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 40px;
    padding-top: 1.35rem;
  }

  .step__num {
    width: 40px;
    height: 40px;
    border-radius: 13px;
    border: 1px solid;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-m);
    font-weight: 500;
    font-size: 0.85rem;
    letter-spacing: 0.06em;
    background: var(--surface-elevated);
    flex-shrink: 0;
  }

  .step__line {
    width: 1px;
    flex: 1;
    min-height: 40px;
    background: none;
    border-left: 1px dashed var(--line);
    margin-top: 0.5rem;
  }

  .step__card {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 1.2rem;
    padding: 1.35rem 1.5rem;
    border-left: 3px solid var(--step-color);
    will-change: transform;
  }

  .step__card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card-hover);
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
  }

  .step__body {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .step__title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .step__text {
    font-size: 0.88rem;
    color: var(--text-secondary);
    line-height: 1.6;
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
