<script setup lang="ts">
import debounce from 'lodash/debounce';
import { Layout, PlotData } from 'plotly.js';
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
import { addSource } from '@/plugins/history/sources/graph';
import { useHistoryStore } from '@/plugins/history/store';
import { GraphConfig, GraphSource, QueryParams } from '@/plugins/history/types';

interface Props {
  graphId: string;
  config: GraphConfig;
  sharedSources?: boolean;
  controlPresets?: boolean;
  controlRange?: boolean;
  teleportControls?: boolean;
  sourceRevision?: Date;
  renderRevision?: Date;
}

const props = withDefaults(defineProps<Props>(), {
  sharedSources: false,
  controlPresets: false,
  controlRange: false,
  teleportControls: false,
  sourceRevision: () => new Date(),
  renderRevision: () => new Date(),
});

const emit = defineEmits<{
  params: [payload: QueryParams];
  layout: [payload: Partial<Layout>];
}>();

const historyStore = useHistoryStore();
const revision = ref(new Date());

const params = computed<QueryParams>({
  get: () => props.config.params ?? {},
  set: (v) => emit('params', v),
});

const layout = computed<Partial<Layout>>({
  get: () => props.config.layout ?? {},
  set: (v) => emit('layout', v),
});

const source = computed<GraphSource | null>(
  () => historyStore.sourceById(props.graphId) as GraphSource | null,
);

const error = computed<string | null>(() => {
  if (!source.value) {
    return props.config.fields.length > 0
      ? 'No data sources'
      : 'No fields selected';
  }
  if (!graphData.value.some((data) => data.x && data.x.length > 0)) {
    return 'No data (yet) for selected period';
  }
  return null;
});

const graphData = computed<Partial<PlotData>[]>(() =>
  source.value ? Object.values(source.value.values) : [],
);

function createSource(): void {
  addSource(
    props.graphId,
    props.config.params,
    props.config.renames,
    props.config.axes,
    props.config.colors,
    props.config.precision,
    props.config.fields,
  );
}

function removeSource(): void {
  historyStore.removeSource(source.value);
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
  () => resetSource(),
);

watch(
  () => source.value,
  (newV: GraphSource | null) => {
    if (newV?.truncated) {
      resetSource();
    }
  },
  { deep: true },
);

onMounted(() => {
  if (!props.sharedSources) {
    createSource();
  } else {
    nextTick(refresh);
  }
});

onBeforeUnmount(() => {
  if (!props.sharedSources) {
    removeSource();
  }
});
</script>

<template>
  <div class="col column">
    <ButtonsTeleport v-if="teleportControls">
      <HistoryGraphControls
        v-model:layout="layout"
        v-model:params="params"
        :show-presets="controlPresets"
        :show-range="controlRange"
      >
        <template #controls>
          <slot name="controls" />
        </template>
      </HistoryGraphControls>
    </ButtonsTeleport>
    <div
      v-else
      class="col-auto row justify-end z-top"
    >
      <HistoryGraphControls
        v-model:layout="layout"
        v-model:params="params"
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
      </div>
    </slot>

    <PlotlyGraph
      v-else
      :data="graphData"
      :layout="layout"
      :revision="revision"
      class="col"
      v-bind="$attrs"
    />
  </div>
</template>
