<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import {
	type FormatKey,
	useGraphFormats,
} from "../../composables/useGraphFormats";

const props = defineProps<{
	isOpen: boolean;
}>();

const emit = defineEmits(["close", "import"]);

const { formats, formatOrder } = useGraphFormats();

const content = ref("");
const selectedFormat = ref<FormatKey>("JSON");

// Load saved format preference on mount
onMounted(() => {
	const saved = localStorage.getItem("pasteFormat");
	if (saved && formatOrder.includes(saved as FormatKey)) {
		selectedFormat.value = saved as FormatKey;
	}
});

// Function to handle Escape key to close modal
const handleKeydown = (e: KeyboardEvent) => {
	if (e.key === "Escape") {
		emit("close");
	}
};

// Add and remove event listener for Escape key
watch(
	() => props.isOpen,
	(isOpen) => {
		if (isOpen) {
			content.value = ""; // Limpiar contenido al abrir
			document.addEventListener("keydown", handleKeydown);
		} else {
			document.removeEventListener("keydown", handleKeydown);
		}
	}
);

// Cleanup on unmount
onUnmounted(() => {
	document.removeEventListener("keydown", handleKeydown);
});

const handleImport = () => {
	if (!content.value.trim()) return;

	// Get the selected format
	const fmt = formats[selectedFormat.value];

	// Try to parse safely
	let success = false;
	try {
		success = fmt.parse(content.value);
	} catch (e) {
		success = false;
		console.error("Error parsing pasted content", e);
	}

	// Save the format preference for next time
	localStorage.setItem("pasteFormat", selectedFormat.value);

	// Emit the result to the parent (App.vue) to show the Toast
	emit("import", success);
	if (success) emit("close");
};
</script>

<template>
	<Transition name="modal">
		<div
			v-if="isOpen"
			class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
			@click.self="$emit('close')"
		>
			<div
				class="bg-white dark:bg-slate-950 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800 transition-colors"
			>
				<div
					class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900"
				>
					<h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">
						Pegar contenido
					</h3>
					<button
						@click="$emit('close')"
						class="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
					>
						✕
					</button>
				</div>

				<div class="p-6 space-y-4">
					<div>
						<label class="text-eyebrow"> Formato </label>
						<select
							v-model="selectedFormat"
							class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100 outline-none transition-all"
						>
							<option v-for="key in formatOrder" :key="key" :value="key">
								{{ key }}
							</option>
						</select>
					</div>

					<div class="flex-1">
						<label class="text-eyebrow"> Contenido </label>
						<textarea
							v-model="content"
							class="w-full h-48 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono resize-none outline-none transition-all bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600"
							placeholder='Ej: {"nodes": [], "edges": []}...'
							spellcheck="false"
						></textarea>
					</div>
				</div>

				<div
					class="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3"
				>
					<button
						@click="$emit('close')"
						class="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
					>
						Cancelar
					</button>
					<button
						@click="handleImport"
						:disabled="!content.trim()"
						class="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
					>
						Importar
					</button>
				</div>
			</div>
		</div>
	</Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
	transition:
		opacity 0.3s ease,
		transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
	opacity: 0;
	transform: scale(0.95);
}
</style>
