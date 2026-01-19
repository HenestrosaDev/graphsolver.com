import { ref } from 'vue';

const show = ref(false);
const message = ref('');
const timeout = ref<number | null>(null);

export function useToast() {
	const triggerToast = (msg: string = '¡Copiado al portapapeles!') => {
		message.value = msg;
		show.value = true;

		if (timeout.value) clearTimeout(timeout.value);

		timeout.value = window.setTimeout(() => {
			show.value = false;
		}, 3000);
	};

	return { show, message, triggerToast };
}
