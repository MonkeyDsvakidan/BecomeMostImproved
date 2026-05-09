<script>
  import { page } from '$app/stores'
  const links = [
    { href: '/', label: 'Home' },
    { href: '/workouts', label: 'Workouts' },
    { href: '/exercises', label: 'Exercises' }
  ]

  const accent = '#FF8C00'
  const bg = '#1a1a1a'
</script>

<nav class="navbar" style="background:{bg};">
  <div class="container">
    <div class="brand">BecomeMostImproved</div>
    <ul class="nav-list">
      {#each links as link}
        <li>
          <a href="{link.href}"
             class:active={$page.url.pathname === link.href}
             aria-current={$page.url.pathname === link.href ? 'page' : undefined}>
            {link.label}
          </a>
        </li>
      {/each}
    </ul>
  </div>
</nav>

<main class="page" style="background:{bg}; color: #f5f5f5; min-height:100vh;">
  <slot />
</main>

<style>
  .navbar {
    color: #fff;
    padding: 0.75rem 1rem;
    box-shadow: 0 1px 0 rgba(255,255,255,0.02) inset;
  }
  .container {
    max-width: 1024px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .brand {
    font-weight: 700;
    font-size: 1.1rem;
    letter-spacing: 0.4px;
  }
  .nav-list {
    list-style: none;
    display: flex;
    gap: 1rem;
    margin: 0;
    padding: 0;
  }
  .nav-list a {
    color: #dcdcdc;
    text-decoration: none;
    padding: 0.35rem 0.5rem;
    border-radius: 6px;
    transition: background-color 160ms ease, color 160ms ease;
  }
  .nav-list a:hover {
    background: rgba(255,255,255,0.03);
    color: #fff;
  }
  .nav-list a.active {
    background: {accent};
    color: #111;
    font-weight: 600;
  }
  main.page {
    padding: 1.25rem;
  }

  @media (max-width: 640px) {
    .container { padding: 0 0.5rem; }
    .nav-list { gap: 0.5rem; }
  }
</style>
<script>
	import Header from './Header.svelte';
	import './layout.css';

	let { children } = $props();
</script>

<div class="app">
	<Header />

	<main>
		{@render children()}
	</main>

	<footer>
		<p>
			visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to learn about SvelteKit
		</p>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
