import { ref } from "vue";

export type ToastSeverity = "success" | "info" | "warning" | "error";

// Global state so multiple components share the same toast instance
const show = ref(false);
const title = ref("");
const message = ref("");
const severity = ref<ToastSeverity>("info");

export function useToast() {
	const triggerToast = (opts: {
		title: string;
		message?: string;
		severity?: ToastSeverity;
		duration?: number;
	}) => {
		title.value = opts.title;
		message.value = opts.message || "";
		severity.value = opts.severity || "info";
		show.value = true;

		// Auto-close after 3 seconds (unless duration is set to 0)
		if (opts.duration !== 0) {
			setTimeout(() => {
				show.value = false;
			}, opts.duration || 3000);
		}
	};

	const close = () => {
		show.value = false;
	};

	return {
		show,
		title,
		message,
		severity,
		triggerToast,
		close,
	};
}
