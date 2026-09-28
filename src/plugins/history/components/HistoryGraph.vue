<script setup lang="ts">
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import union from 'lodash/union';
import { nanoid } from 'nanoid';
import { Layout, PlotData } from 'plotly.js';
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  shallowRef,
  ShallowRef,
  watch,
  watchEffect,
} from 'vue';
import { GraphDataKey } from '@/components/graph/symbols';
import {
  emptyGraphView,
  GraphRange,
  GraphView,
  oldestX,
  viewRange,
} from '@/components/graph/view';
import { migrationGraphHint } from '@/plugins/history/migration';
import { useHistoryStore } from '@/plugins/history/store';
import { legendName, mergeRefined } from '@/plugins/history/store/transformers';
import { GraphConfig, GraphSource, QueryParams } from '@/plugins/history/types';
import { isOpenEndedQuery } from '@/plugins/history/utils';
import { isJsonEqual } from '@/utils/objects';

interface Props {
  graphId: string;
  config: GraphConfig;
  sharedSources?: boolean;
  controlPresets?: boolean;
  controlRange?: boolean;
  teleportControls?: boolean;
  sourceRevision?: Date;
  renderRevision?: Date;
  static?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  sharedSources: false,
  controlPresets: false,
  controlRange: false,
  teleportControls: false,
  sourceRevision: () => new Date(),
  renderRevision: () => new Date(),
  static: false,
});

const emit = defineEmits<{
  params: [payload: QueryParams];
  layout: [payload: Partial<Layout>];
}>();

const NO_DATA = 'No data (yet) for selected period';

const historyStore = useHistoryStore();
const revision = ref(new Date());
const error = ref<string | null>(null);
const graphData = shallowRef<Partial<PlotData>[]>([]);

provide(GraphDataKey, graphData);

const params = computed<QueryParams>({
  get: () => props.config.params ?? {},
  set: (v) => emit('params', v),
});

const layout = computed<Partial<Layout>>({
  get: () => props.config.layout ?? {},
  set: (v) => emit('layout', v),
});

// The x view is kept here, and not in the graph layout:
// it is not persisted, and it outlives the PlotlyGraph,
// which is recreated when the data is reloaded.
const view = shallowRef<GraphView>(emptyGraphView());

// A zoom belongs to the data it was made on.
// A layout edit keeps it.
watch(
  () => [props.config.params, props.config.fields],
  (newV, oldV) => {
    if (!isJsonEqual(newV, oldV)) {
      view.value = emptyGraphView();
    }
  },
);

// A static graph cannot be zoomed, nor reset
watch(
  () => props.static,
  (isStatic) => {
    if (isStatic) {
      view.value = emptyGraphView();
    }
  },
);

// Following new data only applies to queries that keep getting new data
const showFollow = computed<boolean>(
  () =>
    view.value.range != null && !props.static && isOpenEndedQuery(params.value),
);

// The x range the graph showed last.
// While the data reloads, the graph is not shown and has no points to follow.
let shownRange: GraphRange | null = null;
watchEffect(() => {
  if (error.value == null) {
    shownRange = viewRange(view.value, graphData.value);
  }
});

// Turning Follow on or off keeps the window that was shown last,
// also while the data reloads
const follow = computed<boolean>({
  get: () => view.value.follow,
  set: (v) => {
    const range =
      error.value == null ? viewRange(view.value, graphData.value) : shownRange;
    if (range != null) {
      view.value = { range, follow: v };
    }
  },
});

const sourceRef = computed<ShallowRef<GraphSource> | null>(() =>
  historyStore.sourceById<GraphSource>(props.graphId),
);

// A refined window: the window shown, fetched once at its own resolution.
// The graph shows its points inside the window and the live points around it.
// Every graph has its own, also graphs that share the live source.
interface Refinement {
  range: GraphRange;
}
const refineId = `${props.graphId}:refine:${nanoid(6)}`;
const refinement = shallowRef<Refinement | null>(null);

const refinedSourceRef = computed<ShallowRef<GraphSource> | null>(() =>
  refinement.value != null
    ? historyStore.sourceById<GraphSource>(refineId)
    : null,
);

function refine(range: GraphRange): void {
  historyStore.createGraphSource(
    refineId,
    {
      start: new Date(range[0]).toISOString(),
      end: new Date(range[1]).toISOString(),
    },
    props.config.renames,
    props.config.axes,
    props.config.colors,
    props.config.precision,
    props.config.min || {},
    props.config.max || {},
    props.config.fields,
  );
  refinement.value = { range };
}

function dropRefinement(): void {
  if (refinement.value != null) {
    historyStore.removeSource(refineId);
    refinement.value = null;
  }
}

// Showing all data again, or a new query or fields, ends the refinement
watch(view, (v) => {
  if (v.range == null) {
    dropRefinement();
  }
});

// While the graph holds refined points, the y axes fit the window shown:
// refined points are not averaged, so peaks can reach beyond the range before,
// and a box zoom that was not exactly horizontal would fix the y range
const refinedWindow = computed<GraphRange | null>(() =>
  refinement.value != null ? viewRange(view.value, graphData.value) : null,
);

const showRefine = computed<boolean>(
  () => view.value.range != null && !props.static,
);

// On while the window shown is the refined one.
// After another zoom it is off, and refines the new window when turned on.
const refined = computed<boolean>({
  get: () =>
    refinement.value != null &&
    isEqual(refinement.value.range, viewRange(view.value, graphData.value)),
  set: (v) => {
    const range = viewRange(view.value, graphData.value);
    if (v && range != null) {
      refine(range);
    } else {
      dropRefinement();
    }
  },
});

function createSource(): void {
  historyStore.createGraphSource(
    props.graphId,
    props.config.params,
    props.config.renames,
    props.config.axes,
    props.config.colors,
    props.config.precision,
    props.config.min || {},
    props.config.max || {},
    props.config.fields,
  );
}

function removeSource(): void {
  historyStore.removeSource(props.graphId);
}

const resetSource = debounce(
  () => {
    removeSource();
    createSource();
  },
  100,
  { trailing: true },
);

function refresh(): void {
  revision.value = new Date();
}

watch(
  () => props.renderRevision,
  () => refresh(),
);

watch(
  () => props.sourceRevision,
  () => {
    resetSource();
    // With the edited config: the colors, names and limits may have changed.
    // After this update: an edit of the query or the fields ends the refinement.
    nextTick(() => {
      if (refinement.value != null) {
        refine(refinement.value.range);
      }
    });
  },
);

watchEffect(() => {
  // The computed returns a ref, so we need to unwrap twice
  const source = sourceRef.value;

  if (source == null) {
    graphData.value = [];
    error.value =
      props.config.fields.length > 0 ? 'No data sources' : 'No fields selected';
    return;
  }

  // If the live streamed data is getting too much, we need to reset
  // This will then yield lower-resolution data for the entire period
  if (source.value.truncated) {
    error.value = 'Reloading graph ...';
    resetSource();
    return;
  }

  // Plotly gets copies of the traces. The legend shows the value of each field
  // at the right edge of the window shown, and what Plotly writes into its data,
  // such as a legend click, stays with this graph: other graphs may share the source.
  const live = source.value.values;
  // While the live data (re)loads, the graph waits for it:
  // the refined stretch alone would show as if it were all data
  const loaded = Object.values(live).some((v) => v.x.length > 0);
  const fine = loaded ? (refinedSourceRef.value?.value.values ?? {}) : {};
  const traces = union(Object.keys(live), Object.keys(fine)).map((key) => ({
    key,
    trace: live[key] ?? fine[key],
    points: mergeRefined(live[key], fine[key]),
  }));
  const end = props.static
    ? null
    : (viewRange(
        view.value,
        traces.map(({ points }) => points),
      )?.[1] ?? null);
  graphData.value = traces.map(({ key, trace, points }) => ({
    ...trace,
    ...points,
    name: legendName(source.value, key, points, end),
  }));
  error.value = graphData.value.some((data) => data.x && data.x.length > 0)
    ? null
    : NO_DATA;
});

// A live window drops its oldest points as new ones arrive.
// Once a fixed zoom lies before all points that are left, the graph shows all data again.
watch(graphData, (data) => {
  const range = view.value.range;
  const liveWindow =
    !!params.value.duration && !params.value.start && !params.value.end;
  if (range == null || view.value.follow || !liveWindow) {
    return;
  }
  const oldest = oldestX(data);
  if (oldest != null && range[1] < oldest) {
    view.value = emptyGraphView();
  }
});

// Why a graph of a period before the update can be empty for a while after it
const migrationHint = computed<string | null>(() =>
  error.value === NO_DATA
    ? migrationGraphHint(
        historyStore.migration,
        props.config.params ?? {},
        Date.now(),
      )
    : null,
);

if (!props.sharedSources) {
  onMounted(() => createSource());
  onBeforeUnmount(() => removeSource());
}
onBeforeUnmount(() => dropRefinement());
</script>

<template>
  <div class="col column history-graph">
    <ButtonsTeleport v-if="teleportControls">
      <HistoryGraphControls
        v-model:layout="layout"
        v-model:params="params"
        v-model:follow="follow"
        v-model:refined="refined"
        :show-follow="showFollow"
        :show-refine="showRefine"
        :show-presets="controlPresets"
        :show-range="controlRange"
      >
        <template #controls>
          <slot name="controls" />
        </template>
      </HistoryGraphControls>
    </ButtonsTeleport>
    <!--
      Without other controls, the row takes no height:
      the Follow toggle then sits in the top margin of the plot,
      and does not push the plot down when it appears.
    -->
    <div
      v-else
      class="col-auto row justify-end z-top"
      :class="{
        'controls-overlay':
          !controlPresets && !controlRange && !$slots.controls,
      }"
    >
      <HistoryGraphControls
        v-model:layout="layout"
        v-model:params="params"
        v-model:follow="follow"
        v-model:refined="refined"
        :show-follow="showFollow"
        :show-refine="showRefine"
        :show-presets="controlPresets"
        :show-range="controlRange"
      >
        <template #controls>
          <slot name="controls" />
        </template>
      </HistoryGraphControls>
    </div>

    <slot
      v-if="error"
      name="error"
      :error="error"
    >
      <div class="col column items-center justify-center q-gutter-y-md">
        <q-icon
          name="mdi-chart-line"
          size="lg"
          class="col-auto"
        />
        <div class="col-auto row text-h5 justify-center items-center">
          <div class="col-auto q-px-md">
            {{ error }}
          </div>
        </div>
        <div
          v-if="migrationHint"
          class="col-auto text-center q-px-md"
        >
          {{ migrationHint }}
        </div>
      </div>
    </slot>

    <PlotlyGraph
      v-else
      v-model:view="view"
      :layout="layout"
      :fit-y="refinedWindow"
      :revision="revision"
      :static="props.static"
      class="col"
      v-bind="$attrs"
    />
  </div>
</template>

<style lang="sass" scoped>
// The controls are lifted above the plot.
// Isolating the graph keeps them below menus, dialogs and the page header.
.history-graph
  isolation: isolate

.controls-overlay
  height: 0
</style>
