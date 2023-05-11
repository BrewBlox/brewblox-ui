<script setup lang="ts">
import { addSource } from '@/plugins/history/sources/graph';
import { useHistoryStore } from '@/plugins/history/store';
import { GraphConfig, GraphSource, QueryParams } from '@/plugins/history/types';
import { defaultPresets } from '@/plugins/history/utils';
import { isJsonEqual } from '@/utils/objects';
import debounce from 'lodash/debounce';
import { Layout, PlotData } from 'plotly.js';
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  PropType,
  ref,
  watch,
} from 'vue';

const props = defineProps({
  graphId: {
    type: String,
    required: true,
  },
  config: {
    type: Object as PropType<GraphConfig>,
    required: true,
  },
  sharedSources: {
    type: Boolean,
    default: false,
  },
  usePresets: {
    type: Boolean,
    default: false,
  },
  useRange: {
    type: Boolean,
    default: false,
  },
  useTeleport: {
    type: Boolean,
    default: false,
  },
  sourceRevision: {
    type: Date,
    default: () => new Date(),
  },
  renderRevision: {
    type: Date,
    default: () => new Date(),
  },
});

const emit = defineEmits<{
  (e: 'params', data: QueryParams): void;
  (e: 'layout', data: Partial<Layout>): void;
}>();

const historyStore = useHistoryStore();
const presets = defaultPresets();
const revision = ref(new Date());
const displayRef = ref(null);

function saveParams(params: QueryParams): void {
  emit('params', structuredClone(params));
}

function saveLayout(layout: Partial<Layout>): void {
  emit('layout', structuredClone(layout));
}

function isActivePreset(preset: QueryParams): boolean {
  return isJsonEqual(preset, props.config.params);
}

const layout = computed<Partial<Layout>>(() => props.config.layout ?? {});

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
  <div class="column">
    <component
      :is="useTeleport ? 'ButtonsTeleport' : 'div'"
      :class="useTeleport ? '' : 'col-auto row justify-end z-top'"
    >
      <ActionMenu
        v-if="useRange"
        icon="mdi-arrow-expand-vertical"
      >
        <template #menus>
          <GraphRangeSubmenu
            :layout="layout"
            :save="(v) => saveLayout(v)"
          />
        </template>
      </ActionMenu>
      <ActionMenu
        v-if="usePresets"
        icon="mdi-timelapse"
      >
        <template #menus>
          <ActionSubmenu label="Presets">
            <ActionItem
              v-for="(preset, idx) in presets"
              :key="`preset-${idx}`"
              :active="isActivePreset(preset)"
              :label="`${preset.duration}`"
              @click="saveParams(preset)"
            />
          </ActionSubmenu>
        </template>
      </ActionMenu>
      <slot name="controls" />
    </component>
    <div
      v-if="error"
      class="col row justify-center items-center text-h5 q-gutter-x-md"
    >
      <q-icon
        name="warning"
        color="negative"
      />
      <div class="col-auto">
        {{ error }}
      </div>
    </div>
    <PlotlyGraph
      v-else
      ref="displayRef"
      :data="graphData"
      :layout="layout"
      :revision="revision"
      class="col"
      v-bind="$attrs"
    />
  </div>
</template>
