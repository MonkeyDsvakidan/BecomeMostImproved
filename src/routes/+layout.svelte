<script>
  import 'bootstrap/dist/css/bootstrap.min.css';
  import { page } from '$app/stores'
  import { onMount } from 'svelte'
  const links = [
    { href: '/', label: 'Home' },
    { href: '/workouts', label: 'Workouts' },
    { href: '/exercises', label: 'Exercises' }
  ]

  let menuOpen = false

  onMount(async () => {
    await import('bootstrap/dist/js/bootstrap.bundle.min.js')
  })

  $: if ($page.url.pathname) {
    menuOpen = false
  }
</script>

<svelte:head>
  <style>
    :root {
      --bs-primary: #FF8C00;
      --bs-dark: #1a1a1a;
      --bs-body-bg: #1a1a1a;
      --bs-body-color: #f5f5f5;
      --bs-secondary: #2a2a2a;
      --bs-border-color: rgba(255, 255, 255, 0.08);
    }

    html,
    body {
      background: #1a1a1a;
      color: #f5f5f5;
      color-scheme: dark;
    }

    body {
      margin: 0;
    }

    .navbar-brand-gradient {
      background: linear-gradient(135deg, #ff8c00, #ffb366);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    .nav-link {
      transition: color 160ms ease, opacity 160ms ease, transform 160ms ease;
    }

    .nav-link:hover,
    .nav-link:focus {
      opacity: 1;
      transform: translateY(-1px);
    }
  </style>
</svelte:head>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary shadow-sm sticky-top">
  <div class="container-fluid px-3 px-lg-4">
    <a class="navbar-brand fw-bold navbar-brand-gradient" href="/">BecomeMostImproved</a>
    <button
      class="navbar-toggler"
      type="button"
      aria-controls="mainNavbar"
      aria-expanded={menuOpen}
      aria-label="Toggle navigation"
      on:click={() => (menuOpen = !menuOpen)}
    >
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class:show={menuOpen} class="collapse navbar-collapse" id="mainNavbar">
      <ul class="navbar-nav ms-auto mb-2 mb-lg-0 gap-lg-2">
        {#each links as link}
          <li class="nav-item">
            <a
              href={link.href}
              class={`nav-link rounded-3 px-3 ${$page.url.pathname === link.href ? 'active text-primary fw-bold' : 'text-light'}`}
              aria-current={$page.url.pathname === link.href ? 'page' : undefined}
            >
              {link.label}
            </a>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</nav>

<main class="container-fluid py-4 text-light">
  <slot />
</main>
