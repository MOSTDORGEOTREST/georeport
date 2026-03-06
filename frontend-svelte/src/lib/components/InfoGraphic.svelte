<script>
  const steps = [
    {
      color: '#897460',
      text: 'Результаты испытания из протокола загружаются на сервер и хранятся под своим уникальным ключом, исключающим несанкционированный доступ.',
      icon: '/images/lock.gif',
      alt: 'lock'
    },
    {
      color: '#d3a462',
      text: 'Сервер генерирует специальный QR-код, содержащий ссылку для просмотра данных протокола.',
      icon: '/images/server.gif',
      alt: 'server'
    },
    {
      color: '#73893d',
      text: 'QR-код помещается на протокол испытаний, тем самым исключая возможность редактирования данных в протоколе после его выдачи.',
      icon: '/images/qr_transparent.png',
      alt: 'qr'
    }
  ];
</script>

<div class="infographic">
  {#each steps as step, i}
    <div class="step fade-in" style="animation-delay: {i * 0.2}s">
      <div class="step__marker">
        <span class="step__dot" style="background: {step.color}; outline-color: {step.color}"></span>
        {#if i < steps.length - 1}
          <div class="step__line"></div>
        {/if}
      </div>
      <div class="step__card glass" style="border-left: 3px solid {step.color}">
        <p class="step__text">{step.text}</p>
        <div class="step__icon-box">
          <img src={step.icon} alt={step.alt} class="step__icon" />
        </div>
      </div>
    </div>
  {/each}
</div>

<style>
  .infographic {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
  }

  .step {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    opacity: 0;
    animation: fadeIn 0.6s ease-out forwards;
  }

  .step__marker {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 24px;
    padding-top: 1.5rem;
  }

  .step__dot {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 3px solid rgba(255, 255, 255, 0.3);
    outline: 2px solid;
    outline-offset: 3px;
    flex-shrink: 0;
  }

  .step__line {
    width: 2px;
    height: 60px;
    background: linear-gradient(to bottom, var(--text-muted), transparent);
    margin-top: 0.5rem;
  }

  .step__card {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
  }

  .step__text {
    flex: 1;
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .step__icon-box {
    width: 70px;
    min-width: 70px;
    height: 70px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }

  .step__icon {
    width: 45px;
    height: 45px;
    object-fit: contain;
  }

  @media screen and (max-width: 500px) {
    .step__marker {
      display: none;
    }

    .step__icon-box {
      width: 50px;
      min-width: 50px;
      height: 50px;
    }

    .step__icon {
      width: 30px;
      height: 30px;
    }

    .step__text {
      font-size: 0.8rem;
    }
  }
</style>
