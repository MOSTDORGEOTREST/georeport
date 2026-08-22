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
    position: relative;
    flex: 0 0 auto;
    margin-top: 4.5rem;
    background: var(--bg-secondary);
    border-top: 1px solid var(--line-soft);
    padding-bottom: var(--safe-bottom);
  }

  .footer__inner {
    max-width: 1080px;
    margin: 0 auto;
    padding: 2.5rem 1.5rem 1.25rem;
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
    width: 56px;
    height: 56px;
    object-fit: contain;
    background: #F6F2E8;
    border: 1px solid var(--line-soft);
    border-radius: 14px;
    padding: 6px;
    opacity: 0.95;
    transition: var(--transition);
  }

  .footer__logo-link:hover .footer__logo-img {
    opacity: 1;
    border-color: var(--glass-border-hover);
  }

  .footer__brand-copy {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
  }

  .footer__brand-copy strong {
    font-family: var(--font-d);
    font-weight: 600;
    font-size: 0.78rem;
    letter-spacing: 0.1em;
  }

  .footer__brand-copy small {
    margin-top: 0.35rem;
    font-family: var(--font-m);
    color: var(--text-muted);
    font-size: 0.6rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .footer__dev {
    font-family: var(--font-m);
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: var(--text-muted);
    line-height: 1.8;
    max-width: 280px;
  }

  .footer__col {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .footer__col-title {
    font-family: var(--font-m);
    font-weight: 500;
    font-size: 0.64rem;
    text-transform: uppercase;
    letter-spacing: 0.28em;
    color: var(--accent);
    margin-bottom: 0.4rem;
  }

  .footer__link {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    color: var(--text-secondary);
    font-size: 0.85rem;
    min-height: 34px;
    padding-bottom: 0.15rem;
    border-bottom: 1px dashed transparent;
    width: fit-content;
    transition: color 0.25s, border-color 0.25s;
  }

  .footer__link i {
    color: var(--accent);
    font-size: 1rem;
  }

  .footer__link:hover {
    color: var(--accent-bright);
    border-bottom-color: var(--glass-border-hover);
  }

  .footer__bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
    padding-top: 1.25rem;
    border-top: 1px dashed var(--line);
  }

  .footer__copy {
    color: var(--text-muted);
    font-size: 0.8rem;
  }

  .footer__note {
    font-family: var(--font-m);
    color: var(--text-muted);
    font-size: 0.62rem;
    letter-spacing: 0.22em;
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
