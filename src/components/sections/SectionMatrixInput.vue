<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useGraph } from "../../composables/useGraph";
import { IconDice6, IconTrash } from "@tabler/icons-vue";

const { generateRandomGraph, nodes, rawMatrix, numNodes: _numNodes, createGrid, clearMatrix } = useGraph();

const { t } = useI18n();

// Node validation
const numNodes = computed({
	get: () => _numNodes.value,
	set: (val: number) => {
		if (!val || val < 2) {
			_numNodes.value = 2;
		} else {
			_numNodes.value = val;
		}
	},
});

onMounted(() => {
	if (rawMatrix.value.length === 0) createGrid();
});
</script>

<template>
	<div
		class="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
	>
		<div
			class="flex flex-col items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row dark:border-slate-800 dark:bg-slate-800"
		>
			<div class="flex w-full items-center justify-between gap-4">
				<div class="flex items-center gap-3">
					<span class="text-xs font-bold tracking-wide text-slate-500 uppercase select-none dark:text-slate-300">
						{{ t("matrixInput.vertices") }}
					</span>
					<div class="flex items-center overflow-hidden rounded-md shadow-sm">
						<button
							class="flex h-8 w-8 items-center justify-center border-r border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-blue-600 active:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300 dark:active:bg-slate-700"
							@click="numNodes--"
						>
							-
						</button>

						<input
							v-model.number="numNodes"
							type="number"
							min="2"
							class="h-8 w-10 bg-slate-50 text-center text-sm font-bold text-slate-700 focus:bg-white focus:outline-none dark:bg-slate-900/20 dark:text-slate-100 dark:focus:bg-slate-900"
							@blur="numNodes < 2 ? (numNodes = 2) : null"
						>

						<button
							class="flex h-8 w-8 items-center justify-center border-l border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-blue-600 active:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300 dark:active:bg-slate-700"
							@click="numNodes++"
						>
							+
						</button>
					</div>
				</div>

				<div class="flex items-center gap-2">
					<button
						class="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-all hover:border-indigo-300 hover:bg-slate-50 hover:text-indigo-600 active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-indigo-500 dark:hover:bg-slate-800 dark:hover:text-indigo-300"
						:title="t('matrixInput.randomTitle')"
						@click="generateRandomGraph"
					>
						<IconDice6 class="size-4" />
						<span class="hidden sm:inline">{{ t("matrixInput.random") }}</span>
					</button>

					<button
						class="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:border-red-300 hover:bg-red-100 active:scale-95 dark:border-red-900 dark:bg-red-900/30 dark:text-red-300 dark:hover:border-red-800 dark:hover:bg-red-900/40"
						:title="t('matrixInput.clearTitle')"
						@click="clearMatrix"
					>
						<IconTrash class="h-4 w-4" />
						<span class="hidden sm:inline">{{ t("matrixInput.clear") }}</span>
					</button>
				</div>
			</div>
		</div>

		<div class="flex w-full justify-center overflow-x-auto bg-white p-4 sm:p-6 dark:bg-slate-900">
			<div
				v-if="rawMatrix.length"
				class="inline-block overflow-x-auto rounded-lg border border-slate-200 shadow-sm dark:border-slate-800"
			>
				<table class="w-auto table-fixed border-collapse">
					<thead>
						<tr>
							<th
								class="w-10 border-r border-b border-slate-200 bg-slate-50 p-2 sm:w-12 dark:border-slate-800 dark:bg-slate-800/50"
							/>

							<th
								v-for="node in nodes"
								:key="'head-' + node"
								class="animate-fade-in w-14 border-r border-b border-slate-200 bg-slate-50 p-2 text-center text-xs font-bold text-slate-600 select-none last:border-r-0 sm:w-16 sm:text-sm dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200"
							>
								{{ node }}
							</th>
						</tr>
					</thead>
					<tbody>
						<tr
							v-for="(row, i) in rawMatrix"
							:key="'row-' + nodes[i]"
							class="tabular-nums last:border-b-0"
						>
							<td
								class="border-r border-slate-200 bg-slate-50 p-2 text-center text-xs font-bold text-slate-600 select-none sm:text-sm dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200"
								:class="{ 'border-b': i !== rawMatrix.length - 1 }"
							>
								{{ nodes[i] }}
							</td>

							<td
								v-for="(_, j) in row"
								:key="'cell-' + i + '-' + j"
								class="animate-fade-in relative h-10 border-r border-slate-200 p-0 text-center last:border-r-0 sm:h-11 dark:border-slate-800"
								:class="{ 'border-b': i !== rawMatrix.length - 1 }"
							>
								<div
									v-if="i === j"
									class="flex h-full w-full cursor-not-allowed items-center justify-center bg-slate-100 text-sm font-medium text-slate-400 select-none dark:bg-slate-800 dark:text-slate-500"
								>
									0
								</div>

								<input
									v-else
									v-model.number="rawMatrix[i][j]"
									type="number"
									placeholder="∞"
									class="h-full w-full bg-white text-center text-sm font-medium text-slate-800 placeholder-slate-300 outline-none hover:bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:ring-inset dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-600 dark:hover:bg-slate-800"
								>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>

<style scoped>
/* Standard Inputs */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
	-webkit-appearance: none;
	margin: 0;
}
input[type="number"] {
	-moz-appearance: textfield;
}

/* Animations */
@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(-5px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
.animate-fade-in {
	animation: fadeIn 0.4s ease-out backwards;
}
</style>
