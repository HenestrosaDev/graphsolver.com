<script setup lang="ts">
import { computed } from "vue";
import { useToast } from "../../composables/useToast";
import {
	IconCircleCheck,
	IconCircleX,
	IconAlertTriangle,
	IconInfoCircle,
	IconX,
} from "@tabler/icons-vue";

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
				<IconCircleCheck
					v-if="severity === 'success'"
					class="w-5 h-5"
					:class="currentVariant.icon"
				/>
				<IconCircleX
					v-else-if="severity === 'error'"
					class="size-5"
					:class="currentVariant.icon"
				/>
				<IconAlertTriangle
					v-else-if="severity === 'warning'"
					class="size-5"
					:class="currentVariant.icon"
				/>
				<IconInfoCircle v-else class="size-5" :class="currentVariant.icon" />
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
				<IconX class="size-3" />
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
