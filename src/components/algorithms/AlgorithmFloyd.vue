<script setup lang="ts">
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-vue";
import { ref, computed, watch, onMounted, onActivated, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { useGraph } from "../../composables/useGraph";
import { computeFloyd } from "../../composables/useFloyd";
import { useTheme } from "../../composables/useTheme";
import PropertiesCard from "../properties/PropertiesCard.vue";
import PropertyRow from "../properties/PropertyRow.vue";
import type { FloydStep } from "../../types/graph";
const {
	getGraphData,
	nodes,
	toIdx,
	rawMatrix,
	numNodes,
	setHighlightPath,
	clearHighlights,
} = useGraph();

const steps = ref<FloydStep[]>([]);
const diameter = ref<number>(0);
const hasInfPairs = ref<boolean>(false);
const finalDist = ref<number[][]>([]);
const finalNext = ref<(number | null)[][]>([]);
const { t } = useI18n();
const { isDark } = useTheme();

// --- CAROUSEL STATE ---
const currentStepIndex = ref(0);
const currentStep = computed(() => steps.value[currentStepIndex.value]);

const startNode = ref<string>("A");
const endNode = ref<string>("B");
const safeStartNode = computed(() => {
	const available = nodes.value;
	if (!available.length) return startNode.value;
	return available.includes(startNode.value) ? startNode.value : available[0];
});
const safeEndNode = computed(() => {
	const available = nodes.value;
	if (!available.length) return endNode.value;
	return available.includes(endNode.value)
		? endNode.value
		: available[available.length - 1];
});

const queryResult = computed(() => {
	if (!finalDist.value.length) return null;
	if (!nodes.value.length) return null;

	const u = toIdx(safeStartNode.value);
	const v = toIdx(safeEndNode.value);

	if (
		u < 0 ||
		u >= finalDist.value.length ||
		v < 0 ||
		v >= finalDist.value.length
	)
		return null;

	const d = finalDist.value[u][v];
	if (d === Infinity)
		return { status: "unreachable" as const, dist: null, path: null };

	let pathArr: string[] = [nodes.value[u]];
	let curr: number = u;
	while (curr !== v) {
		const nextNode = finalNext.value[curr][v];
		if (nextNode === null) break;
		curr = nextNode;
		pathArr.push(nodes.value[curr]);
	}
	return { status: "ok" as const, dist: d, path: pathArr.join(" → "), pathArr };
});

const minCostValue = computed(() => {
	if (!queryResult.value) return null;
	return queryResult.value.status === "ok"
		? queryResult.value.dist
		: t("floyd.unreachableCost");
});

const pathValue = computed(() => {
	if (!queryResult.value) return null;
	return queryResult.value.status === "ok"
		? queryResult.value.path
		: t("floyd.noPath");
});

const resultVariant = computed(() =>
	queryResult.value?.status === "ok" ? "metric" : "badge"
);

const applyHighlight = () => {
	const result = queryResult.value;
	clearHighlights();
	if (!result || result.status !== "ok") return;
	if (result.pathArr && result.pathArr.length >= 2)
		setHighlightPath(result.pathArr);
};

const solveFloyd = () => {
	const { matrix } = getGraphData();
	const { steps: newSteps, dist, next, diameter: dia, hasInfPairs: inf } =
		computeFloyd(matrix, nodes.value);

	steps.value = newSteps;
	finalDist.value = dist;
	finalNext.value = next;
	diameter.value = dia;
	hasInfPairs.value = inf;
	applyHighlight();
};

// --- AUTOMATIC REACTIVITY ---
watch(
	nodes,
	(newNodes) => {
		if (!newNodes.length) return;
		if (!newNodes.includes(startNode.value)) startNode.value = newNodes[0];
		if (!newNodes.includes(endNode.value))
			endNode.value = newNodes[newNodes.length - 1];
	},
	{ immediate: true }
);

watch(
	[rawMatrix, numNodes],
	() => {
		solveFloyd();
		// Reset the carousel to the beginning
		currentStepIndex.value = 0;
	},
	{ deep: true, immediate: true }
);

watch(queryResult, applyHighlight, { immediate: true });
onMounted(() => applyHighlight());
onActivated(async () => {
	await nextTick();
	applyHighlight();
});

// --- NAVIGATION FUNCTIONS ---
const nextStep = () => {
	if (currentStepIndex.value < steps.value.length - 1) currentStepIndex.value++;
};

const prevStep = () => {
	if (currentStepIndex.value > 0) currentStepIndex.value--;
};

const currentStepTitle = computed(() => {
	const step = currentStep.value;
	if (!step) return "";
	if (step.pivot === -1) return t("floyd.initialTitle");
	const pivotLabel = nodes.value[step.pivot] ?? step.pivot;
	return t("floyd.stepTitle", { k: step.k ?? currentStepIndex.value, pivot: pivotLabel });
});

const footerDescription = computed(() => {
	const step = currentStep.value;
	if (!step) return "";
	if (step.pivot === -1) return t("floyd.initialDescription");
	const pivotLabel = nodes.value[step.pivot] ?? step.pivot;
	return t("floyd.iterationDescription", { pivot: pivotLabel });
});

const progressPercentage = computed(() => {
	if (steps.value.length <= 1) return 0;
	return (currentStepIndex.value / (steps.value.length - 1)) * 100;
});

const rangeStyle = computed(() => {
	const progressColor = isDark.value ? 'rgb(96 165 250)' : 'rgb(37 99 235)'; // blue-400 in dark, blue-600 in light
	const remainingColor = isDark.value ? 'rgb(71 85 105)' : 'rgb(203 213 225)'; // slate-500 in dark, slate-200 in light
	return {
		background: `linear-gradient(to right, ${progressColor} 0%, ${progressColor} ${progressPercentage.value}%, ${remainingColor} ${progressPercentage.value}%, ${remainingColor} 100%)`
	};
});
</script>

<template>
	<div class="space-y-8">
		<div>
			<h3 class="text-eyebrow">{{ t("floyd.routeTitle") }}</h3>

			<PropertiesCard>
				<template #header>
					<div class="flex flex-wrap items-center justify-between gap-4 w-full">
						<div class="flex items-center gap-2">
							<label class="text-xs font-bold uppercase tracking-wide">
								{{ t("floyd.origin") }}
							</label>
							<select
								v-model="startNode"
								class="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-100 text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium "
							>
								<option v-for="n in nodes" :key="n" :value="n">{{ n }}</option>
							</select>
						</div>

						<div class="text-lg text-slate-400">→</div>

						<div class="flex items-center gap-2">
							<label class="text-xs font-bold uppercase tracking-wide">
								{{ t("floyd.destination") }}
							</label>
							<select
								v-model="endNode"
								class="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-100 text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium "
							>
								<option v-for="n in nodes" :key="n" :value="n">{{ n }}</option>
							</select>
						</div>
					</div>
				</template>

				<PropertyRow
					:label="t('floyd.minCost')"
					:value="minCostValue"
					:variant="resultVariant"
				/>
				<!-- <span v-if="hasInfPairs" class="text-xs text-red-500 ml-2">(pares inalcanzables)</span>-->
				<PropertyRow
					:label="t('floyd.optimalPath')"
					:value="pathValue"
					:variant="resultVariant"
				/>
				<PropertyRow
					:label="t('floyd.diameter')"
					:tooltip="t('floyd.diameterTooltip')"
					:value="diameter"
					:variant="typeof diameter === 'string' ? 'badge' : 'metric'"
				/>
			</PropertiesCard>
		</div>

		<div>
			<h3 v-if="steps.length > 0" class="text-eyebrow">
				{{ t("floyd.iterationsTable") }}
			</h3>

			<div
				v-if="steps.length > 0"
				class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden "
			>
				<div class="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 p-4">
					<div class="flex flex-col items-center">
						<span
							class="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
						>
							{{ t("floyd.stepCounter", { current: currentStepIndex + 1, total: steps.length }) }}
						</span>

						<h3 class="font-bold text-slate-800 dark:text-slate-100 text-lg mt-3">
							{{ currentStepTitle }}
						</h3>

						<div
							class="flex items-center justify-center gap-3 w-full max-w-md -mb-1"
						>
							<button
								@click="prevStep"
								:disabled="currentStepIndex === 0"
								class="p-1.5 rounded-full hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-slate-500 dark:text-slate-300 disabled:opacity-30 disabled:hover:shadow-none disabled:hover:border-transparent transition-all"
								:title="t('floyd.previous')"
							>
								<IconChevronLeft class="size-6" />
							</button>

							<div class="flex-1 mx-2 relative flex items-center">
								<input
									type="range"
									min="0"
									:max="steps.length - 1"
									v-model.number="currentStepIndex"
									:style="rangeStyle"
									class="w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
								/>
							</div>

							<button
								@click="nextStep"
								:disabled="currentStepIndex === steps.length - 1"
								class="p-1.5 rounded-full hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-slate-500 dark:text-slate-300 disabled:opacity-30 disabled:hover:shadow-none disabled:hover:border-transparent transition-all"
								:title="t('floyd.next')"
							>
								<IconChevronRight class="size-6" />
							</button>
						</div>
					</div>
				</div>

				<div
					class="p-6 overflow-x-auto flex justify-center min-h-[300px] items-center bg-white dark:bg-slate-900 transition-all duration-300"
				>
					<table
						class="text-sm border-collapse shadow-sm rounded-lg overflow-hidden"
					>
						<thead>
							<tr>
								<th class="p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800"></th>
								<th
									v-for="n in nodes"
									:key="n"
									class="p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-500 dark:text-slate-300 text-xs w-10 text-center"
								>
									{{ n }}
								</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(row, i) in currentStep.matrix" :key="i">
								<th
									class="p-3 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-800 font-bold text-slate-500 dark:text-slate-300 text-xs w-10 text-center"
								>
									{{ nodes[i] }}
								</th>

								<td
									v-for="(val, j) in row"
									:key="j"
									class="p-3 border border-slate-100 dark:border-slate-800 text-center text-sm w-12 h-12  duration-200"
									:class="{
										'bg-blue-50 dark:bg-blue-900/30 font-bold text-blue-700 dark:text-blue-200 ring-1 ring-inset ring-blue-200 dark:ring-blue-800':
											i === currentStep.pivot || j === currentStep.pivot,
										'text-slate-400 dark:text-slate-500': val === Infinity,
										'text-slate-800 dark:text-slate-100': val !== Infinity,
									}"
								>
									{{ val === Infinity ? "∞" : val }}
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<div
					class="bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-500 dark:text-slate-300 text-center border-t border-slate-200 dark:border-slate-800"
				>
					<span>{{ footerDescription }}</span>
				</div>
			</div>
		</div>
	</div>
</template>
