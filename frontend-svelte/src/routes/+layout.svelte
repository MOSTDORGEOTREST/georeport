<script>
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import CookieConsent from '$lib/components/CookieConsent.svelte';
  import Toast from '$lib/components/Toast.svelte';

  let { children } = $props();
</script>

<Header />

<main class="main">
  <div class="container">
    {@render children()}
  </div>
</main>

<Footer />
<CookieConsent />
<Toast />

<style>
  .main {
    flex: 1 0 auto;
    padding-top: calc(var(--header-height) + 1.5rem);
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
