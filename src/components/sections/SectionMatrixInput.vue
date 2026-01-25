<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useGraph } from "../../composables/useGraph";
import { IconDice6, IconTrash } from "@tabler/icons-vue";

const {
	generateRandomGraph,
	nodes,
	rawMatrix,
	numNodes: _numNodes,
	createGrid,
	clearMatrix,
} = useGraph();

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
		class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-6 "
	>
		<div
			class="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4"
		>
			<div class="flex items-center w-full justify-between gap-4">
				<div class="flex items-center gap-3">
					<span
						class="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide select-none"
					>
						{{ t("matrixInput.vertices") }}
					</span>
					<div class="flex items-center shadow-sm rounded-md overflow-hidden">
						<button
							@click="numNodes--"
							class="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition active:bg-blue-50 dark:active:bg-slate-700"
						>
							-
						</button>

						<input
							type="number"
							v-model.number="numNodes"
							@blur="numNodes < 2 ? (numNodes = 2) : null"
							min="2"
							class="w-10 h-8 text-center text-sm font-bold text-slate-700 dark:text-slate-100 focus:outline-none focus:bg-white dark:focus:bg-slate-900 bg-slate-50 dark:bg-slate-900"
						/>

						<button
							@click="numNodes++"
							class="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition active:bg-blue-50 dark:active:bg-slate-700"
						>
							+
						</button>
					</div>
				</div>

				<div class="flex items-center gap-2">
					<button
						@click="generateRandomGraph"
						class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-300 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all active:scale-95"
						:title="t('matrixInput.randomTitle')"
					>
						<IconDice6 class="size-4" />
						<span class="hidden sm:inline">{{ t("matrixInput.random") }}</span>
					</button>

					<button
						@click="clearMatrix"
						class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 hover:border-red-300 dark:hover:border-red-800 transition active:scale-95"
						:title="t('matrixInput.clearTitle')"
					>
						<IconTrash class="h-4 w-4" />
						<span class="hidden sm:inline">{{ t("matrixInput.clear") }}</span>
					</button>
				</div>
			</div>
		</div>

		<div class="p-4 sm:p-6 overflow-x-auto w-full flex justify-center bg-white dark:bg-slate-900">
			<div
				class="inline-block rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
				v-if="rawMatrix.length"
			>
				<table class="border-collapse table-fixed w-auto">
					<thead>
						<tr>
							<th
								class="p-2 bg-slate-50 dark:bg-slate-800 border-r border-b border-slate-200 dark:border-slate-800 w-10 sm:w-12"
							></th>

							<th
								v-for="node in nodes"
								:key="'head-' + node"
								class="animate-fade-in p-2 bg-slate-50 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-200 text-xs sm:text-sm text-center select-none w-14 sm:w-16 border-b border-r border-slate-200 dark:border-slate-800 last:border-r-0"
							>
								{{ node }}
							</th>
						</tr>
					</thead>
					<tbody>
						<tr
							v-for="(row, i) in rawMatrix"
							:key="'row-' + nodes[i]"
							class="last:border-b-0 tabular-nums"
						>
							<td
								class="p-2 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-800 font-bold text-center text-slate-600 dark:text-slate-200 text-xs sm:text-sm select-none"
								:class="{ 'border-b': i !== rawMatrix.length - 1 }"
							>
								{{ nodes[i] }}
							</td>

							<td
								v-for="(_, j) in row"
								:key="'cell-' + i + '-' + j"
								class="animate-fade-in p-0 text-center relative h-10 sm:h-11 border-r border-slate-200 dark:border-slate-800 last:border-r-0"
								:class="{ 'border-b': i !== rawMatrix.length - 1 }"
							>
								<div
									v-if="i === j"
									class="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-medium text-sm cursor-not-allowed select-none"
								>
									0
								</div>

								<input
									v-else
									type="number"
									v-model.number="rawMatrix[i][j]"
									placeholder="∞"
									class="w-full h-full text-center text-sm focus:ring-2 focus:ring-inset focus:ring-blue-500 outline-none  font-medium bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-600"
								/>
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
