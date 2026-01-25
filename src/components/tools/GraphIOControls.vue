<script setup lang="ts">
import { ref } from "vue";
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
			label="Exportar"
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
					Descargar
				</DropdownItem>

				<DropdownItem @click="handleCopy(formatKey)"> Copiar </DropdownItem>
			</template>
		</DropdownMenu>

		<DropdownMenu
			label="Importar"
			:is-open="activeMenu === 'import'"
			@toggle="toggleMenu('import')"
			@close="closeMenu"
		>
			<template #icon>
				<IconUpload class="size-4" />
			</template>

			<DropdownHeader>Archivo</DropdownHeader>
			<DropdownItem
				v-for="formatKey in formatOrder"
				:key="formatKey"
				@click="handleImportFile(formatKey)"
			>
				{{ formatKey }}
			</DropdownItem>

			<DropdownDivider />

			<DropdownHeader>Texto</DropdownHeader>
			<DropdownItem @click="handlePaste">Pegar</DropdownItem>
		</DropdownMenu>
	</div>
</template>
