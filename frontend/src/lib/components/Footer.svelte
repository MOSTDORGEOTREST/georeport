<footer class="footer">
  <div class="footer__inner">
    <div class="footer__grid" id="contact">
      <div class="footer__brand">
        <a href="https://mdgt.ru/" target="_blank" rel="noreferrer" class="footer__logo-link" aria-label="Сайт МДГТ">
          <img src="/images/mdgt.png" alt="МДГТ" class="footer__logo-img" />
          <span class="footer__brand-copy">
            <strong>МОСТДОРГЕОТРЕСТ</strong>
            <small>Геотехническая лаборатория</small>
          </span>
        </a>
        <p class="footer__dev">Разработано специалистами лаборатории МДГТ</p>
      </div>

      <div class="footer__col">
        <h3 class="footer__col-title">Контакты</h3>
        <a href="mailto:support@mdgt.ru" class="footer__link">
          <i class="ri-mail-line" aria-hidden="true"></i>
          support@mdgt.ru
        </a>
        <a href="https://mdgt.ru/" class="footer__link" target="_blank" rel="noreferrer">
          <i class="ri-global-line" aria-hidden="true"></i>
          mdgt.ru
        </a>
      </div>

      <div class="footer__col">
        <h3 class="footer__col-title">Документы</h3>
        <a
          class="footer__link"
          href="/static/docs/Согласие_на_обработку_ПД_на сайт.pdf"
          target="_blank"
          rel="noreferrer"
        >
          <i class="ri-file-text-line" aria-hidden="true"></i>
          Согласие на обработку ПД
        </a>
        <a
          class="footer__link"
          href="/static/docs/Политика_на сайт.pdf"
          target="_blank"
          rel="noreferrer"
        >
          <i class="ri-shield-line" aria-hidden="true"></i>
          Политика конфиденциальности
        </a>
      </div>
    </div>

    <div class="footer__bottom">
      <span class="footer__copy">&copy; Мостдоргеотрест {new Date().getFullYear()}</span>
      <span class="footer__note">GEOREPORT — гарантия подлинности данных</span>
    </div>
  </div>
</footer>

<style>
  .footer {
    flex: 0 0 auto;
    margin-top: 4rem;
    background: rgba(255, 255, 255, 0.58);
    border-top: 1px solid var(--glass-border);
    padding-bottom: var(--safe-bottom);
  }

  .footer__inner {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2.25rem 1.5rem 1.25rem;
  }

  .footer__grid {
    display: grid;
    grid-template-columns: 1.4fr 1fr 1fr;
    gap: 2rem;
    padding-bottom: 1.5rem;
    scroll-margin-top: calc(var(--header-height) + 1rem);
  }

  .footer__brand {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .footer__logo-link {
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    color: var(--text-primary);
  }

  .footer__logo-img {
    width: 62px;
    height: 62px;
    object-fit: contain;
    opacity: 0.92;
    transition: var(--transition);
  }

  .footer__logo-link:hover .footer__logo-img {
    opacity: 1;
  }

  .footer__brand-copy {
    display: flex;
    flex-direction: column;
    line-height: 1.15;
  }

  .footer__brand-copy strong {
    font-size: 0.86rem;
    letter-spacing: 0.08em;
  }

  .footer__brand-copy small {
    margin-top: 0.35rem;
    color: var(--text-muted);
    font-size: 0.68rem;
    letter-spacing: 0.04em;
  }

  .footer__dev {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-muted);
    line-height: 1.6;
    max-width: 260px;
  }

  .footer__col {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .footer__col-title {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-secondary);
    margin-bottom: 0.25rem;
  }

  .footer__link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-muted);
    font-size: 0.85rem;
    min-height: 32px;
  }

  .footer__link i {
    color: var(--accent-light);
    font-size: 1rem;
  }

  .footer__link:hover {
    color: var(--accent-bright);
  }

  .footer__bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
    padding-top: 1.25rem;
    border-top: 1px solid var(--glass-border);
  }

  .footer__copy {
    color: var(--text-muted);
    font-size: 0.8rem;
  }

  .footer__note {
    color: var(--text-muted);
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  @media screen and (max-width: 700px) {
    .footer__inner {
      padding: 2rem 1rem 1.25rem;
    }

    .footer__grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .footer__bottom {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
  }
</style>
