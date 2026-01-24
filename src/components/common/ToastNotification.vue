<script setup lang="ts">
import { computed } from "vue";
import { useToast } from "../../composables/useToast";

const { show, message, title, severity, close } = useToast();

const variants = {
	success: {
		container: "bg-green-50 border-green-200 text-green-800",
		icon: "text-green-500",
		button: "text-green-500 hover:bg-green-100 focus:ring-green-500",
	},
	error: {
		container: "bg-red-50 border-red-200 text-red-800",
		icon: "text-red-500",
		button: "text-red-500 hover:bg-red-100 focus:ring-red-500",
	},
	warning: {
		container: "bg-yellow-50 border-yellow-200 text-yellow-800",
		icon: "text-yellow-500",
		button: "text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-500",
	},
	info: {
		container: "bg-blue-50 border-blue-200 text-blue-800",
		icon: "text-blue-500",
		button: "text-blue-500 hover:bg-blue-100 focus:ring-blue-500",
	},
};

const currentVariant = computed(() => variants[severity?.value || "info"]);
</script>

<template>
	<Transition name="toast">
		<div
			v-if="show"
			class="fixed bottom-8 left-1/2 -translate-x-1/2 p-4 rounded-lg border shadow-lg z-50 w-[calc(100%-2rem)] sm:w-auto sm:min-w-[340px] max-w-lg grid grid-cols-[auto_1fr_auto] gap-x-3 items-start"
			:class="currentVariant.container"
			role="alert"
		>
			<div class="flex items-center justify-center h-5 mt-0.5 shrink-0">
				<svg
					v-if="severity === 'success'"
					class="w-5 h-5"
					:class="currentVariant.icon"
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					fill="currentColor"
					viewBox="0 0 20 20"
				>
					<path
						d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"
					/>
				</svg>
				<svg
					v-else-if="severity === 'error'"
					class="w-5 h-5"
					:class="currentVariant.icon"
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					fill="currentColor"
					viewBox="0 0 20 20"
				>
					<path
						d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"
					/>
				</svg>
				<svg
					v-else-if="severity === 'warning'"
					class="w-5 h-5"
					:class="currentVariant.icon"
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					fill="currentColor"
					viewBox="0 0 20 20"
				>
					<path
						d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"
					/>
				</svg>
				<svg
					v-else
					class="w-5 h-5"
					:class="currentVariant.icon"
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					fill="currentColor"
					viewBox="0 0 20 20"
				>
					<path
						d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"
					/>
				</svg>
			</div>

			<div
				class="text-sm font-medium pt-0.5"
				:class="[message ? 'self-start' : 'self-center']"
			>
				<span v-if="title">{{ title }}</span>
				<span v-else class="sr-only">Notification</span>
			</div>

			<button
				type="button"
				class="-mx-1.5 -my-1 rounded-lg focus:ring-2 p-1.5 inline-flex items-center justify-center size-8 ml-auto"
				:class="currentVariant.button"
				@click="close"
				aria-label="Close"
			>
				<span class="sr-only">Close</span>
				<svg
					class="size-3"
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 14 14"
				>
					<path
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
					/>
				</svg>
			</button>

			<div
				v-if="message"
				class="col-start-2 col-span-2 text-sm opacity-90 mt-1"
			>
				{{ message }}
			</div>
		</div>
	</Transition>
</template>

<style scoped>
.toast-enter-active {
	transition: all 0.3s ease-in-out;
}

.toast-leave-active {
	transition: all 0.15s ease-in-out;
}

/* When entering: it comes from below (it looks like it is rising) */
.toast-enter-from {
	opacity: 0;
	transform: translate(0, 100%);
}

/* When leaving: it goes down */
.toast-leave-to {
	opacity: 0;
	transform: translate(0, 100%);
}
</style>
