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
	},
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
			class="fixed inset-0 z-50 bg-slate-900/60 p-4 backdrop-blur-sm"
			@click.self="$emit('close')"
		>
			<div
				class="absolute top-1/2 left-1/2 flex max-h-[90vh] w-full max-w-[90vw] -translate-x-1/2 -translate-y-1/2 transform flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl sm:max-w-lg dark:border-slate-800 dark:bg-slate-950"
			>
				<div
					class="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900"
				>
					<h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">
						{{ title }}
					</h3>
					<button
						class="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
						:aria-label="t('common.close')"
						@click="$emit('close')"
					>
						✕
					</button>
				</div>

				<slot />

				<div
					v-if="secondaryButtonText || primaryButtonText"
					class="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900"
				>
					<div class="flex gap-2">
						<button
							v-if="secondaryButtonText"
							class="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
							:class="secondaryButtonClass"
							:disabled="isSecondaryDisabled"
							@click="$emit('secondaryAction')"
						>
							<slot name="secondaryButtonIcon" />
							{{ secondaryButtonText }}
						</button>

						<button
							v-if="primaryButtonText"
							class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
							:class="primaryButtonClass"
							:disabled="isPrimaryDisabled"
							@click="$emit('primaryAction')"
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
