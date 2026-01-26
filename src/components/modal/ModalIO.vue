<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import {
	type FormatKey,
	useGraphFormats,
} from "../../composables/useGraphFormats";
import { useGraphIO } from "../../composables/useGraphIO";
import { IconCopy, IconDownload, IconUpload } from "@tabler/icons-vue";
import ModalContainer from "./ModalContainer.vue";

const { formats, formatOrder } = useGraphFormats();
const { copyToClipboard, downloadFile } = useGraphIO();
const { t } = useI18n();

export type ModalIOMode = "import" | "export";

const props = defineProps<{
	mode: ModalIOMode;
	isOpen: boolean;
}>();

const emit = defineEmits(["import", "close"]);

const content = ref("");
const selectedFormat = ref<FormatKey>("JSON");

// Load saved format preference on mount
onMounted(() => {
	const saved = localStorage.getItem(`${props.mode}Format`);
	if (saved && formatOrder.includes(saved as FormatKey)) {
		selectedFormat.value = saved as FormatKey;
	}
});

// Computed property for generated content in export mode
const generatedContent = computed(() => {
	if (props.mode === "export") {
		return formats[selectedFormat.value].serialize();
	}
	return "";
});

// Get textarea content based on mode
const textareaContent = computed({
	get: () => (props.mode === "import" ? content.value : generatedContent.value),
	set: (value) => {
		if (props.mode === "import") {
			content.value = value;
		}
		// Export mode is readonly, so no setter needed
	},
});

// Get content label based on mode
const contentLabel = computed(() => {
	return props.mode === "import"
		? t("modalPaste.contentLabel")
		: t("modalExport.contentLabel");
});

// Get placeholder text based on mode
const placeholder = computed(() => {
	return props.mode === "import"
		? t("modalPaste.placeholder")
		: t("modalExport.placeholder");
});

// Handle import
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
	localStorage.setItem("importFormat", selectedFormat.value);

	// Emit the result to the parent to show the Toast
	emit("import", success);
	if (success) emit("close");
};

// Handle copy to clipboard
const handleCopy = async () => {
	await copyToClipboard(generatedContent.value, selectedFormat.value);
	localStorage.setItem("exportFormat", selectedFormat.value);
	emit("close");
};

// Handle download
const handleDownload = () => {
	const fmt = formats[selectedFormat.value];
	downloadFile(
		generatedContent.value,
		`grafo-${Date.now()}`,
		fmt.ext,
		fmt.mime
	);
	localStorage.setItem("exportFormat", selectedFormat.value);
	emit("close");
};

// Get modal title based on mode
const modalTitle = computed(() => {
	return props.mode === "import"
		? t("modalPaste.title")
		: t("modalExport.title", { format: selectedFormat.value });
});

// Get primary button text based on mode
const primaryButtonText = computed(() => {
	return props.mode === "import"
		? t("modalPaste.import")
		: t("modalExport.download");
});

// Get secondary button text based on mode
const secondaryButtonText = computed(() => {
	return props.mode === "import"
		? null
		: t("modalExport.copy");
});

// Check if primary button should be disabled
const isPrimaryDisabled = computed(() => {
	return props.mode === "import" ? !content.value.trim() : false;
});

// Clear content when opening import modal
watch(
	() => props.isOpen,
	(isOpen) => {
		if (isOpen) {
			if (props.mode === "import") {
				content.value = "";
			}
		}
	}
);
</script>

<template>
	<ModalContainer
		:title="modalTitle"
		:is-open="props.isOpen"
		:primary-button-text="primaryButtonText"
		:secondary-button-text="secondaryButtonText"
		:is-primary-disabled="isPrimaryDisabled"
		@close="$emit('close')"
		@primary-action="props.mode === 'import' ? handleImport() : handleDownload()"
		@secondary-action="props.mode === 'import' ? null : handleCopy()"
	>
		<div class="p-6 space-y-8">
			<div>
				<label class="text-eyebrow"> {{ t("modalPaste.formatLabel") }} </label>
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
				<label class="text-eyebrow"> {{ contentLabel }} </label>
				<textarea
					v-model="textareaContent"
					:readonly="mode === 'export'"
					class="w-full h-48 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono resize-none outline-none transition-all bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600"
					:placeholder="placeholder"
					spellcheck="false"
				></textarea>
			</div>
		</div>

		<template v-if="mode === 'export'" #secondaryButtonIcon>
			<IconCopy class="size-4" />
		</template>

		<template #primaryButtonIcon>
			<IconDownload v-if="mode === 'export'" class="size-4" />
			<IconUpload v-else class="size-4" />
		</template>
	</ModalContainer>
</template>
