import { writable } from 'svelte/store';

const initialState = {
	visible: false,
	message: '',
	variant: 'success'
};

const toastStore = writable(initialState);
let hideTimer;

function showToast(message, variant = 'success', duration = 3000) {
	if (!message) return;

	if (hideTimer) {
		clearTimeout(hideTimer);
	}

	toastStore.set({
		visible: true,
		message,
		variant
	});

	hideTimer = setTimeout(() => {
		toastStore.set(initialState);
		hideTimer = undefined;
	}, duration);
}

function hideToast() {
	if (hideTimer) {
		clearTimeout(hideTimer);
		hideTimer = undefined;
	}
	toastStore.set(initialState);
}

export const toast = {
	subscribe: toastStore.subscribe
};

export function showSuccessToast(message, duration = 3000) {
	showToast(message, 'success', duration);
}

export function showErrorToast(message, duration = 3000) {
	showToast(message, 'danger', duration);
}

export { showToast, hideToast };
