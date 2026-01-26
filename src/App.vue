<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useHead } from "@unhead/vue";
import { useGraphFormats } from "./composables/useGraphFormats";
import { useToast } from "./composables/useToast";
import { useGraphIO } from "./composables/useGraphIO";

import Navbar from "./components/common/Navbar.vue";
import Footer from "./components/common/Footer.vue";
import MatrixInput from "./components/sections/SectionMatrixInput.vue";
import ToastNotification from "./components/common/ToastNotification.vue";
import SectionCard from "./components/sections/SectionCard.vue";
import SectionAlgorithms from "./components/sections/SectionAlgorithms.vue";
import SectionVisualizer from "./components/sections/SectionVisualizer.vue";
import SectionProperties from "./components/sections/SectionProperties.vue";
import GraphIOControls from "./components/tools/GraphIOControls.vue";
import ModalIO, { type ModalIOMode } from "./components/modal/ModalIO.vue";
import { IconEye, IconCpu, IconChartBar } from "@tabler/icons-vue";

// Composables
const { formats, getFormatByExtension } = useGraphFormats();
const { triggerToast } = useToast();
const { readFileContent } = useGraphIO();
const { t, locale } = useI18n();

// Dynamic head
const headTitle = computed(() => t("head.title"));
const headDescription = computed(() => t("head.description"));
const headKeywords = computed(() => t("head.keywords"));
const headOgImage = computed(() => t("head.ogImage"));

useHead({
	title: headTitle,
	htmlAttrs: {
		lang: locale,
	},
	meta: [
		{ name: "description", content: headDescription },
		{ name: "keywords", content: headKeywords },
		{ property: "og:title", content: headTitle },
		{ property: "og:description", content: headDescription },
		{ property: "og:image", content: headOgImage },
		{ name: "twitter:card", content: "summary_large_image" },
		{ name: "twitter:title", content: headTitle },
		{ name: "twitter:description", content: headDescription },
		{ name: "twitter:image", content: headOgImage },
	],
});

// State
const fileInput = ref<HTMLInputElement | null>(null);
const modalState = ref<{
	isOpen: boolean;
	mode: ModalIOMode;
}>({
	isOpen: false,
	mode: "import",
});

const prepareFileInput = (accept: string) => {
	if (fileInput.value) {
		fileInput.value.accept = accept;
		fileInput.value.click();
	}
};

const handleFileChange = async (event: Event) => {
	const target = event.target as HTMLInputElement;
	const file = target.files?.[0];
	if (!file) return;

	try {
		const content = await readFileContent(file);
		const formatKey = getFormatByExtension(file.name);

		if (!formatKey) throw new Error(t("app.toast.unsupportedFormat"));

		const success = formats[formatKey].parse(content);
		if (success) {
			triggerToast({
				title: t("app.toast.importSuccess"),
				severity: "success",
			});
		} else {
			throw new Error(t("app.toast.invalidContent"));
		}
	} catch (error: any) {
		triggerToast({
			title: error.message || t("app.toast.readError"),
			severity: "error",
		});
	} finally {
		if (fileInput.value) fileInput.value.value = "";
	}
};

const handlePasteResult = (success: boolean) => {
	triggerToast({
		title: success ? t("app.toast.pasteSuccess") : t("app.toast.pasteError"),
		severity: success ? "success" : "error",
	});
};

const openModal = (mode: ModalIOMode) => {
	modalState.value.isOpen = true;
	modalState.value.mode = mode;
};
</script>

<template>
	<div
		class="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 flex flex-col"
	>
		<Navbar />

		<main class="grow w-full max-w-5xl mx-auto p-4 py-6 md:p-8">
			<input
				type="file"
				ref="fileInput"
				class="hidden"
				@change="handleFileChange"
			/>

			<div>
				<div class="flex justify-between items-center mb-6 gap-4">
					<h2 class="text-2xl font-bold text-slate-700 dark:text-slate-100">
						{{ t("app.adjacencyTitle") }}
					</h2>

					<GraphIOControls
						@trigger-file-input="prepareFileInput"
						@open-modal="openModal"
					/>
				</div>

				<MatrixInput />
			</div>

			<div class="mt-12">
				<h2 class="text-2xl font-bold text-slate-700 dark:text-slate-100 mb-6">
					{{ t("app.analysisTitle") }}
				</h2>

				<div
					class="lg:grid lg:grid-cols-2 max-lg:flex max-lg:flex-col gap-6 items-stretch"
				>
					<div class="h-full">
						<SectionCard
							:title="t('app.visualizationTitle')"
							class="h-full flex flex-col"
							body-class="flex-1 flex flex-col min-h-[400px]"
						>
							<template #icon
								><IconEye class="size-5 text-amber-600"
							/></template>
							<SectionVisualizer class="flex-1 w-full h-full" />
						</SectionCard>
					</div>

					<div>
						<SectionCard :title="t('app.algorithmsTitle')">
							<template #icon>
								<IconCpu class="size-5 text-indigo-600" />
							</template>
							<SectionAlgorithms />
						</SectionCard>
					</div>

					<SectionCard :title="t('app.propertiesTitle')" class="col-span-2">
						<template #icon>
							<IconChartBar class="size-5 text-green-600" />
						</template>
						<SectionProperties />
					</SectionCard>
				</div>
			</div>
		</main>

		<Footer />

		<ModalIO
			:is-open="modalState.isOpen"
			:mode="modalState.mode"
			@close="modalState.isOpen = false"
			@import="handlePasteResult"
		/>
		<ToastNotification />
	</div>
</template>
