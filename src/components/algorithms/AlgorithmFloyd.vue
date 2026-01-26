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
const { getGraphData, nodes, toIdx, rawMatrix, numNodes, setHighlightPath, clearHighlights } = useGraph();

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
	return available.includes(endNode.value) ? endNode.value : available[available.length - 1];
});

const queryResult = computed(() => {
	if (!finalDist.value.length) return null;
	if (!nodes.value.length) return null;

	const u = toIdx(safeStartNode.value);
	const v = toIdx(safeEndNode.value);

	if (u < 0 || u >= finalDist.value.length || v < 0 || v >= finalDist.value.length) return null;

	const d = finalDist.value[u][v];
	if (d === Infinity) return { status: "unreachable" as const, dist: null, path: null };

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
	return queryResult.value.status === "ok" ? queryResult.value.dist : t("floyd.unreachableCost");
});

const pathValue = computed(() => {
	if (!queryResult.value) return null;
	return queryResult.value.status === "ok" ? queryResult.value.path : t("floyd.noPath");
});

const resultVariant = computed(() => (queryResult.value?.status === "ok" ? "metric" : "badge"));

const applyHighlight = () => {
	const result = queryResult.value;
	clearHighlights();
	if (!result || result.status !== "ok") return;
	if (result.pathArr && result.pathArr.length >= 2) setHighlightPath(result.pathArr);
};

const solveFloyd = () => {
	const { matrix } = getGraphData();
	const { steps: newSteps, dist, next, diameter: dia, hasInfPairs: inf } = computeFloyd(matrix, nodes.value);

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
		if (!newNodes.includes(endNode.value)) endNode.value = newNodes[newNodes.length - 1];
	},
	{ immediate: true },
);

watch(
	[rawMatrix, numNodes],
	() => {
		solveFloyd();
		// Reset the carousel to the beginning
		currentStepIndex.value = 0;
	},
	{ deep: true, immediate: true },
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
	const progressColor = isDark.value ? "rgb(96 165 250)" : "rgb(37 99 235)"; // blue-400 in dark, blue-600 in light
	const remainingColor = isDark.value ? "rgb(71 85 105)" : "rgb(203 213 225)"; // slate-500 in dark, slate-200 in light
	const gradient = `linear-gradient(to right,
		${progressColor} 0%,
		${progressColor} ${progressPercentage.value}%,
		${remainingColor} ${progressPercentage.value}%,
		${remainingColor} 100%)`;
	return {
		background: gradient,
	};
});
</script>

<template>
	<div class="space-y-8">
		<div>
			<h3 class="text-eyebrow">
				{{ t("floyd.routeTitle") }}
			</h3>

			<PropertiesCard>
				<template #header>
					<div class="flex w-full flex-wrap items-center justify-between gap-4">
						<div class="flex items-center gap-2">
							<label class="text-xs font-bold tracking-wide uppercase">
								{{ t("floyd.origin") }}
							</label>
							<select
								v-model="startNode"
								class="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
							>
								<option
									v-for="n in nodes"
									:key="n"
									:value="n"
								>
									{{ n }}
								</option>
							</select>
						</div>

						<div class="text-lg text-slate-400">
							→
						</div>

						<div class="flex items-center gap-2">
							<label class="text-xs font-bold tracking-wide uppercase">
								{{ t("floyd.destination") }}
							</label>
							<select
								v-model="endNode"
								class="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
							>
								<option
									v-for="n in nodes"
									:key="n"
									:value="n"
								>
									{{ n }}
								</option>
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
			<h3
				v-if="steps.length > 0"
				class="text-eyebrow"
			>
				{{ t("floyd.iterationsTable") }}
			</h3>

			<div
				v-if="steps.length > 0"
				class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
			>
				<div class="border-b border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800">
					<div class="flex flex-col items-center">
						<span
							class="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-blue-700 uppercase dark:bg-blue-900/40 dark:text-blue-200"
						>
							{{ t("floyd.stepCounter", { current: currentStepIndex + 1, total: steps.length }) }}
						</span>

						<h3 class="mt-3 text-lg font-bold text-slate-800 dark:text-slate-100">
							{{ currentStepTitle }}
						</h3>

						<div class="-mb-1 flex w-full max-w-md items-center justify-center gap-3">
							<button
								:disabled="currentStepIndex === 0"
								class="rounded-full border border-transparent p-1.5 text-slate-500 transition-all hover:border-slate-200 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:border-transparent disabled:hover:shadow-none dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900"
								:title="t('floyd.previous')"
								@click="prevStep"
							>
								<IconChevronLeft class="size-6" />
							</button>

							<div class="relative mx-2 flex flex-1 items-center">
								<input
									v-model.number="currentStepIndex"
									type="range"
									min="0"
									:max="steps.length - 1"
									:style="rangeStyle"
									class="h-2 w-full cursor-pointer appearance-none rounded-lg accent-blue-600 hover:accent-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
								>
							</div>

							<button
								:disabled="currentStepIndex === steps.length - 1"
								class="rounded-full border border-transparent p-1.5 text-slate-500 transition-all hover:border-slate-200 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:border-transparent disabled:hover:shadow-none dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900"
								:title="t('floyd.next')"
								@click="nextStep"
							>
								<IconChevronRight class="size-6" />
							</button>
						</div>
					</div>
				</div>

				<div class="min-h-[300px] w-full overflow-x-auto bg-white p-6 transition-all duration-300 dark:bg-slate-900">
					<table class="mx-auto border-collapse overflow-hidden rounded-lg text-sm shadow-sm">
						<thead>
							<tr>
								<th
									class="border-r border-b border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50"
								/>
								<th
									v-for="n in nodes"
									:key="n"
									class="w-10 border-r border-b border-slate-200 bg-slate-50 p-3 text-center text-xs font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300"
								>
									{{ n }}
								</th>
							</tr>
						</thead>
						<tbody>
							<tr
								v-for="(row, i) in currentStep.matrix"
								:key="i"
							>
								<th
									class="w-10 border-r border-b border-slate-200 bg-slate-50 p-3 text-center text-xs font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300"
								>
									{{ nodes[i] }}
								</th>

								<td
									v-for="(val, j) in row"
									:key="j"
									class="h-12 w-12 border border-slate-100 p-3 text-center text-sm duration-200 dark:border-slate-800"
									:class="{
										'bg-blue-50 font-bold text-blue-700 ring-1 ring-blue-200 ring-inset dark:bg-blue-900/30 dark:text-blue-200 dark:ring-blue-800':
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
					class="border-t border-slate-200 bg-slate-50 p-3 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
				>
					<span>{{ footerDescription }}</span>
				</div>
			</div>
		</div>
	</div>
</template>
