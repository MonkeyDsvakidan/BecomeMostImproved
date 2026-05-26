<script>
	import { toast, hideToast } from '$lib/stores/toast';
</script>

{#if $toast.visible}
	<div class="toast-wrapper" role="status" aria-live="polite" aria-atomic="true">
		<div class={`alert alert-${$toast.variant} shadow-lg border-0 mb-0`}>
			<div class="d-flex align-items-center gap-3">
				<span>{$toast.message}</span>
				<button type="button" class="btn-close" aria-label="Close" on:click={hideToast}></button>
			</div>
		</div>
	</div>
{/if}

<style>
	.toast-wrapper {
		position: fixed;
		top: 5.5rem;
		right: 1rem;
		z-index: 1200;
		width: min(26rem, calc(100vw - 2rem));
		animation: toast-enter 180ms ease-out;
	}

	.alert {
		color: #111111;
	}

	@keyframes toast-enter {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
