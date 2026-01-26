<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { IconInfoCircle } from "@tabler/icons-vue";

interface Props {
	text: string;
}

const props = defineProps<Props>();
const rootRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<HTMLElement | null>(null); // Reference to the floating content
const { t } = useI18n();

const isHoverDevice = ref(true);
const isOpen = ref(false);

// State for dynamic position
const placement = ref({
	isTop: true, // Is it shown above or below?
	xOffset: 0, // Horizontal offset (in px) so it doesn't go out
	top: 0, // Absolute top position
	left: 0, // Absolute left position
});

const updateDeviceType = () => {
	const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
	isHoverDevice.value = mediaQuery.matches;
	if (isHoverDevice.value) isOpen.value = false;
	return mediaQuery;
};

const handleClickOutside = (event: Event) => {
	if (!isOpen.value) return;
	if (rootRef.value && !rootRef.value.contains(event.target as Node)) {
		isOpen.value = false;
	}
};

// --- POSITIONING LOGIC ---
const recalculatePosition = async () => {
	if (!rootRef.value || !tooltipRef.value) return;

	// We wait for the DOM so the element has real dimensions
	await nextTick();

	const triggerRect = rootRef.value.getBoundingClientRect();
	const tooltipRect = tooltipRef.value.getBoundingClientRect();
	const padding = 16; // Safety margin with the screen edge

	// Calculate absolute position
	const triggerCenterX = triggerRect.left + triggerRect.width / 2;
	const triggerTop = triggerRect.top;
	const triggerBottom = triggerRect.bottom;

	// Vertical position: decide above or below
	let isTop = true;
	if (triggerTop < tooltipRect.height + padding) {
		isTop = false;
	}

	// Horizontal position: initially centered
	let left = triggerCenterX - tooltipRect.width / 2;

	// Adjust if it goes out on the sides
	if (left < padding) {
		left = padding;
	} else if (left + tooltipRect.width > window.innerWidth - padding) {
		left = window.innerWidth - padding - tooltipRect.width;
	}

	// Calculate offset for the arrow (difference between desired center and actual)
	const desiredCenter = triggerCenterX;
	const actualCenter = left + tooltipRect.width / 2;
	const xOffset = desiredCenter - actualCenter;

	placement.value = {
		isTop,
		xOffset,
		top: isTop ? triggerTop - tooltipRect.height - 8 : triggerBottom + 8,
		left,
	};
};

// We modify show to recalculate when opening
const show = () => {
	isOpen.value = true;
	recalculatePosition();
};

const hide = () => {
	isOpen.value = false;
};

const toggleForTouch = () => {
	if (isHoverDevice.value) return;
	if (!isOpen.value) {
		show(); // We use show() so it recalculates
	} else {
		hide();
	}
};

let hoverMediaQuery: MediaQueryList | null = null;

onMounted(() => {
	hoverMediaQuery = updateDeviceType();
	hoverMediaQuery.addEventListener("change", updateDeviceType);
	document.addEventListener("click", handleClickOutside);
	// Listen to scroll and resize to readjust if open
	window.addEventListener("scroll", () => isOpen.value && recalculatePosition(), true);
	window.addEventListener("resize", () => isOpen.value && recalculatePosition());
});

onBeforeUnmount(() => {
	if (hoverMediaQuery) hoverMediaQuery.removeEventListener("change", updateDeviceType);
	document.removeEventListener("click", handleClickOutside);
});

const isVisible = computed(() => isOpen.value);
</script>

<template>
	<div
		ref="rootRef"
		class="relative inline-flex items-center justify-center"
	>
		<button
			type="button"
			class="cursor-help text-slate-400 hover:text-slate-600 focus:outline-none"
			:aria-label="t('common.showHelpTooltip')"
			:aria-expanded="isVisible"
			@focus="isHoverDevice && show()"
			@blur="isHoverDevice && hide()"
			@pointerenter="isHoverDevice && show()"
			@pointerleave="isHoverDevice && hide()"
			@click.prevent="toggleForTouch"
		>
			<IconInfoCircle class="pointer-events-none size-3.5" />
		</button>

		<div
			ref="tooltipRef"
			class="pointer-events-none fixed z-50 w-48 transition-opacity duration-200 ease-in-out"
			:class="[isVisible ? 'visible opacity-100' : 'invisible opacity-0']"
			:style="{
				top: `${placement.top}px`,
				left: `${placement.left}px`,
			}"
		>
			<div class="relative rounded bg-slate-800 px-3 py-2 text-center text-xs leading-relaxed text-white shadow-xl">
				<!-- eslint-disable-next-line vue/no-v-html -->
				<span v-html="props.text" />

				<div
					class="absolute left-1/2 -translate-x-1/2 border-4 border-transparent"
					:class="[
						// If the tooltip is above, the arrow goes down (border-t-slate-800)
						// If the tooltip is below, the arrow goes up (border-b-slate-800)
						placement.isTop ? 'top-full border-t-slate-800' : 'bottom-full border-b-slate-800',
					]"
					:style="{
						// The arrow must move to point to the center of the trigger
						transform: `translateX(${placement.xOffset}px)`,
					}"
				/>
			</div>
		</div>
	</div>
</template>
