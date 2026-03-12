<script>
</script>

<footer class="footer">
  <div class="footer__dev">
    РАЗРАБОТАНО ГЕОТЕХНИЧЕСКОЙ ЛАБОРАТОРИЕЙ МОСТДОРГЕОТРЕСТ
  </div>

  <div class="footer__contacts" id="contact">
    <div class="footer__contact-group">
      <h3 class="footer__contact-title">
        <i class="ri-mail-line"></i> Почта:
      </h3>
      <a href="mailto:mostdorgeotrest@mail.ru" class="footer__contact-link" target="_blank" rel="noreferrer">
        support@mdgt.ru
      </a>
    </div>

    <div class="footer__contact-group">
      <h3 class="footer__contact-title">
        <i class="ri-global-line"></i> Веб-сайт:
      </h3>
      <a href="https://mdgt.ru/" class="footer__contact-link" target="_blank" rel="noreferrer">
        mdgt.ru
      </a>
    </div>
  </div>

  <div class="footer__bottom">
    <a href="https://mdgt.ru/" target="_blank" rel="noreferrer" class="footer__logo-link">
      <img src="/images/mdgt.png" alt="МДГТ" class="footer__logo-img" />
    </a>
    <span class="footer__copy">&copy; Мостдоргеотрест {new Date().getFullYear()}</span>
  </div>

  <div class="footer__docs">
    <a
      class="footer__doc-link"
      href="/static/docs/Согласие_на_обработку_ПД_на сайт.pdf"
      target="_blank"
      rel="noreferrer"
    >
      Согласие на обработку персональных данных
    </a>
    <a
      class="footer__doc-link"
      href="/static/docs/Политика_на сайт.pdf"
      target="_blank"
      rel="noreferrer"
    >
      Политика конфиденциальности
    </a>
  </div>
</footer>

<style>
  .footer {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-top: 4rem;
    padding: 2rem 1.5rem 1rem;
    background: rgba(255, 255, 255, 0.03);
    border-top: 1px solid var(--glass-border);
  }

  .footer__dev {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--text-muted);
    text-align: center;
  }

  .footer__contacts {
    display: flex;
    gap: 3rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .footer__contact-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .footer__contact-title {
    font-size: 0.9rem;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .footer__contact-link {
    color: var(--text-muted);
    font-size: 0.85rem;
  }

  .footer__contact-link:hover {
    color: var(--accent-light);
  }

  .footer__bottom {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--glass-border);
    width: 100%;
    justify-content: center;
  }

  .footer__logo-img {
    width: 40px;
    height: 40px;
    opacity: 0.7;
    transition: var(--transition);
  }

  .footer__logo-img:hover {
    opacity: 1;
  }

  .footer__copy {
    color: var(--text-muted);
    font-size: 0.8rem;
  }

  .footer__docs {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
  }

  .footer__doc-link {
    font-size: 0.7rem;
    color: var(--text-muted);
    text-decoration: underline;
  }

  .footer__doc-link:hover {
    color: var(--accent-light);
  }
</style>
