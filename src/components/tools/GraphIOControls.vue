<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { IconDownload, IconUpload } from "@tabler/icons-vue";
import { type FormatKey, useGraphFormats } from "../../composables/useGraphFormats";
import DropdownDivider from "../common/dropdown/DropdownDivider.vue";
import DropdownHeader from "../common/dropdown/DropdownHeader.vue";
import DropdownItem from "../common/dropdown/DropdownItem.vue";
import DropdownMenu from "../common/dropdown/DropdownMenu.vue";

const emit = defineEmits(["trigger-file-input", "open-modal"]);

const { formats, formatOrder } = useGraphFormats();
const { t } = useI18n();

// State: We control which menu is open via a string
const activeMenu = ref<"import" | null>(null);

const toggleMenu = (menu: "import") => {
	activeMenu.value = activeMenu.value === menu ? null : menu;
};

const closeMenu = () => {
	activeMenu.value = null;
};

// --- Business Actions ---
const handleExportModal = () => {
	emit("open-modal", "export");
};

const handleImportModal = () => {
	emit("open-modal", "import");
	closeMenu();
};

const handleImportFile = (format: FormatKey) => {
	emit("trigger-file-input", formats[format].accept);
	closeMenu();
};
</script>

<template>
	<div class="flex gap-2">
		<button
			class="group relative flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
			:title="t('graphIO.export')"
			@click="handleExportModal"
		>
			<div class="text-slate-500 group-hover:text-blue-600 dark:text-slate-300 dark:group-hover:text-blue-300">
				<IconDownload class="size-4" />
			</div>
			<span class="hidden sm:inline">{{ t("graphIO.export") }}</span>
		</button>

		<DropdownMenu
			:label="t('graphIO.import')"
			:is-open="activeMenu === 'import'"
			@toggle="toggleMenu('import')"
			@close="closeMenu"
		>
			<template #icon>
				<IconUpload class="size-4" />
			</template>

			<DropdownHeader>{{ t("graphIO.file") }}</DropdownHeader>
			<DropdownItem
				v-for="formatKey in formatOrder"
				:key="formatKey"
				@click="handleImportFile(formatKey)"
			>
				{{ formatKey }}
			</DropdownItem>

			<DropdownDivider />

			<DropdownHeader>{{ t("graphIO.text") }}</DropdownHeader>
			<DropdownItem @click="handleImportModal">
				{{ t("graphIO.paste") }}
			</DropdownItem>
		</DropdownMenu>
	</div>
</template>
