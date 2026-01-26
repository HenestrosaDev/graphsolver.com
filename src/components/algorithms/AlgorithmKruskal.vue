<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useGraph } from "../../composables/useGraph";
import { computeKruskal } from "../../composables/useKruskal";
import PropertiesCard from "../properties/PropertiesCard.vue";
import PropertyRow from "../properties/PropertyRow.vue";
import type { MSTResult } from "../../types/graph";

const { getGraphData, nodes, rawMatrix, numNodes, clearHighlights } = useGraph();
const { t } = useI18n();

const result = ref<MSTResult | null>(null);
const solveMST = () => {
	clearHighlights();
	const { matrix, isSymmetric } = getGraphData();
	if (!isSymmetric) {
		result.value = {
			cost: t("kruskal.invalidGraph"),
			edges: "",
			isUniqueKey: "requiresUndirected",
		};
		return;
	}
	result.value = computeKruskal(matrix, nodes.value);
};

const uniqueSolutionStatus = computed(() => {
	if (!result.value) return { text: "", classes: "" };
	const key = result.value.isUniqueKey;

	if (key === "notConnected") {
		return {
			text: t(`kruskal.${key}`),
			classes:
				"bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-300 " +
				"dark:border-slate-700 cursor-help",
		};
	}

	if (key === "uniqueYes") {
		return {
			text: t(`kruskal.${key}`),
			classes:
				"bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-200 " +
				"dark:border-green-700",
		};
	}

	if (key === "uniqueNo") {
		return {
			text: t(`kruskal.${key}`),
			classes: "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-200 " + "dark:border-red-800",
		};
	}

	// Fallback for requiresUndirected
	return {
		text: t(`kruskal.${key}`),
		classes:
			"bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 " + "dark:text-slate-300 dark:border-slate-700",
	};
});

watch([rawMatrix, numNodes], solveMST, { deep: true, immediate: true });
</script>

<template>
	<PropertiesCard
		v-if="result"
		:title="t('kruskal.resultTitle')"
	>
		<PropertyRow
			:label="t('kruskal.minCost')"
			:tooltip="t('kruskal.minCostTooltip')"
			:value="result.cost"
			:variant="typeof result.cost === 'string' ? 'badge' : 'metric'"
		/>

		<PropertyRow
			:label="t('kruskal.edgesSelected')"
			:tooltip="t('kruskal.edgesTooltip')"
			:value="result.edges ? result.edges : '-'"
			variant="metric"
		/>

		<PropertyRow
			:label="t('kruskal.uniqueSolution')"
			:tooltip="t('kruskal.uniqueTooltip')"
			:value="uniqueSolutionStatus.text"
			variant="badge"
			:badge-class="uniqueSolutionStatus.classes"
		/>
	</PropertiesCard>
</template>
