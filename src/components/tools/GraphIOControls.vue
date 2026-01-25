<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { IconDownload, IconUpload } from "@tabler/icons-vue";
import {
	type FormatKey,
	useGraphFormats,
} from "../../composables/useGraphFormats";
import { useGraphIO } from "../../composables/useGraphIO";
import DropdownDivider from "../common/dropdown/DropdownDivider.vue";
import DropdownHeader from "../common/dropdown/DropdownHeader.vue";
import DropdownItem from "../common/dropdown/DropdownItem.vue";
import DropdownMenu from "../common/dropdown/DropdownMenu.vue";

const emit = defineEmits(["trigger-file-input", "open-paste-modal"]);

const { formats, formatOrder } = useGraphFormats();
const { downloadFile, copyToClipboard } = useGraphIO();
const { t } = useI18n();

// Estado: Controlamos qué menú está abierto mediante un string
const activeMenu = ref<"export" | "import" | null>(null);

const toggleMenu = (menu: "export" | "import") => {
	activeMenu.value = activeMenu.value === menu ? null : menu;
};

const closeMenu = () => {
	activeMenu.value = null;
};

// --- Acciones de Negocio ---
const handleExport = (format: FormatKey) => {
	const fmt = formats[format];
	downloadFile(fmt.serialize(), `grafo-${Date.now()}`, fmt.ext, fmt.mime);
	closeMenu();
};

const handleCopy = async (format: FormatKey) => {
	await copyToClipboard(formats[format].serialize(), format);
	closeMenu();
};

const handleImportFile = (format: FormatKey) => {
	emit("trigger-file-input", formats[format].accept);
	closeMenu();
};

const handlePaste = () => {
	emit("open-paste-modal");
	closeMenu();
};
</script>

<template>
	<div class="flex gap-2">
		<DropdownMenu
			:label="t('graphIO.export')"
			:is-open="activeMenu === 'export'"
			@toggle="toggleMenu('export')"
			@close="closeMenu"
		>
			<template #icon>
				<IconDownload class="size-4" />
			</template>

			<template v-for="(formatKey, idx) in formatOrder" :key="formatKey">
				<DropdownDivider v-if="idx > 0" />

				<DropdownHeader>{{ formatKey }}</DropdownHeader>
				<DropdownItem @click="handleExport(formatKey)">
					{{ t("graphIO.download") }}
				</DropdownItem>

				<DropdownItem @click="handleCopy(formatKey)"> {{ t("graphIO.copy") }} </DropdownItem>
			</template>
		</DropdownMenu>

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
			<DropdownItem @click="handlePaste">{{ t("graphIO.paste") }}</DropdownItem>
		</DropdownMenu>
	</div>
</template>
