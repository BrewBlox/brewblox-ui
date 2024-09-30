<script setup lang="ts">
import debounce from 'lodash/debounce';
import { Layout, PlotData } from 'plotly.js';
import {
  computed,
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

const sourceRef = computed<ShallowRef<GraphSource> | null>(() =>
  historyStore.sourceById<GraphSource>(props.graphId),
);

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
  () => resetSource(),
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

  graphData.value = Object.values(source.value.values);
  error.value = graphData.value.some((data) => data.x && data.x.length > 0)
    ? null
    : 'No data (yet) for selected period';
});

if (!props.sharedSources) {
  onMounted(() => createSource());
  onBeforeUnmount(() => removeSource());
}
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
      :layout="layout"
      :revision="revision"
      class="col"
      v-bind="$attrs"
    />
  </div>
</template>
