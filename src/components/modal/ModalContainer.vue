<script setup lang="ts">
import { onUnmounted, watch } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps<{
	title: string;
	isOpen: boolean;
	primaryButtonClass?: string;
	secondaryButtonClass?: string;
	primaryButtonText?: string;
	secondaryButtonText?: string | null;
	isSecondaryDisabled?: boolean;
	isPrimaryDisabled?: boolean;
}>();

const emit = defineEmits(["close", "secondaryAction", "primaryAction"]);

const { t } = useI18n();

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
</script>

<template>
	<Transition name="modal">
		<div
			v-if="isOpen"
			class="fixed inset-0 z-50 p-4 bg-slate-900/60 backdrop-blur-sm"
			@click.self="$emit('close')"
		>
			<div
				class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-950 rounded-xl shadow-2xl w-full overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800 max-w-[90vw] sm:max-w-lg"
			>
				<div
					class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900"
				>
					<h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">
						{{ title }}
					</h3>
					<button
						@click="$emit('close')"
						class="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
						:aria-label="t('common.close')"
					>
						✕
					</button>
				</div>

				<slot />

				<div
					v-if="secondaryButtonText || primaryButtonText"
					class="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3"
				>
					<div class="flex gap-2">
						<button
							v-if="secondaryButtonText"
							@click="$emit('secondaryAction')"
							class="flex px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 items-center gap-2 shadow-sm"
							:class="secondaryButtonClass"
							:disabled="isSecondaryDisabled"
						>
							<slot name="secondaryButtonIcon" />
							{{ secondaryButtonText }}
						</button>

						<button
							v-if="primaryButtonText"
							@click="$emit('primaryAction')"
							class="flex px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm gap-2 items-center"
							:class="primaryButtonClass"
							:disabled="isPrimaryDisabled"
						>
							<slot name="primaryButtonIcon" />
							{{ primaryButtonText }}
						</button>
					</div>
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
