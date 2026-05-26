<script>
	import 'bootstrap/dist/css/bootstrap.min.css';
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
	import ToastNotification from '$lib/components/ToastNotification.svelte';
	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/workouts', label: 'Workouts' },
		{ href: '/exercises', label: 'Exercises' }
	];

	let menuOpen = false;

	$: if ($page.url.pathname) {
		menuOpen = false;
	}
</script>

<svelte:head>
	<style>
		:root {
			--bs-primary: #ff8c00;
			--bs-dark: #1a1a1a;
			--bs-body-bg: #121212;
			--bs-body-color: #f5f5f5;
			--bs-secondary: #2a2a2a;
			--bs-border-color: rgba(255, 255, 255, 0.08);
		}

		html,
		body {
			background: linear-gradient(180deg, #111111 0%, #1a1a1a 50%, #121212 100%);
			color: #f5f5f5;
			color-scheme: dark;
			min-height: 100%;
		}

		body {
			margin: 0;
		}

		main {
			min-height: calc(100vh - 72px);
		}

		.navbar-brand-gradient {
			background: linear-gradient(135deg, #ff8c00, #ffb366);
			-webkit-background-clip: text;
			background-clip: text;
			color: transparent;
		}

		.brand-icon {
			width: 4rem;
			height: 4rem;
			flex: 0 0 auto;
		}

		.nav-link {
			transition:
				color 160ms ease,
				opacity 160ms ease,
				transform 160ms ease;
		}

		.nav-link:hover,
		.nav-link:focus {
			opacity: 1;
			transform: translateY(-1px);
		}
	</style>
</svelte:head>

<nav
	class="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary shadow-sm sticky-top"
>
	<div class="container-fluid px-3 px-lg-4">
		<a
			class="navbar-brand fw-bold navbar-brand-gradient d-flex align-items-center gap-2"
			href={resolve('/')}
		>
			<img src="/icon.svg" alt="" aria-hidden="true" class="brand-icon" />
			<span>BecomeMostImproved</span>
		</a>
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
				{#each links as link, index (link.href + index)}
					<li class="nav-item">
						<a
							href={resolve(link.href)}
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

<ToastNotification />
