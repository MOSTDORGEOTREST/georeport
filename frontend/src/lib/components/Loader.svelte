<div class="loader">
  <div class="loader__spinner"></div>
</div>

<style>
  .loader {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem;
  }

  .loader__spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--glass-border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
