<script lang="ts">
import debounce from 'lodash/debounce';
import { Layout, PlotData } from 'plotly.js';
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  PropType,
  ref,
  watch,
} from 'vue';

import { defaultPresets } from '@/plugins/history/const';
import { addSource } from '@/plugins/history/sources/graph';
import { historyStore } from '@/plugins/history/store';
import {
  GraphConfig,
  GraphSource,
  QueryParams,
  QueryTarget,
} from '@/plugins/history/types';
import { isJsonEqual } from '@/utils/objects';

export default defineComponent({
  name: 'HistoryGraph',
  props: {
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
    sourceRevision: {
      type: Date,
      default: () => new Date(),
    },
    renderRevision: {
      type: Date,
      default: () => new Date(),
    },
  },
  emits: ['params', 'layout', 'downsample'],
  setup(props, { emit }) {
    const presets = defaultPresets();
    const revision = ref(new Date());
    const displayRef = ref(null);

    function saveParams(params: QueryParams): void {
      emit('params', { ...params });
    }

    function saveLayout(layout: Partial<Layout>): void {
      emit('layout', { ...layout });
    }

    function isActivePreset(preset: QueryParams): boolean {
      return isJsonEqual(preset, props.config.params);
    }

    function sourceId(target: QueryTarget): string {
      return `${props.graphId}/${target.measurement}`;
    }

    const targets = computed<QueryTarget[]>(
      () => props.config.targets ?? [],
    );

    const fields = computed<string[]>(
      () => targets.value
        .flatMap(t => t.fields.map(f => `${t.measurement}/${f}`)),
    );

    const layout = computed<Partial<Layout>>(
      () => props.config.layout ?? {},
    );

    const source = computed<GraphSource | null>(
      () => historyStore.sourceById(props.graphId) as GraphSource | null,
    );

    const error = computed<string | null>(
      () => {
        if (!source.value) {
          return fields.value.length > 0
            ? 'No data sources'
            : 'No fields selected';
        }
        if (!graphData.value.some(data => data.x && data.x.length > 0)) {
          return 'No data (yet) for selected period';
        }
        return null;
      },
    );

    const graphData = computed<Partial<PlotData>[]>(
      () => source.value
        ? Object.values(source.value.values)
        : [],
    );

    function createSource(): void {
      addSource(
        props.graphId,
        props.config.params ?? {},
        props.config.renames ?? {},
        props.config.axes ?? {},
        props.config.colors ?? {},
        props.config.precision ?? {},
        fields.value,
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

    onMounted(() => {
      if (!props.sharedSources) {
        createSource();
      }
      else {
        nextTick(refresh);
      }
    });

    onBeforeUnmount(() => {
      if (!props.sharedSources) {
        removeSource();
      }
    });

    return {
      layout,
      presets,
      revision,
      displayRef,
      saveParams,
      saveLayout,
      isActivePreset,
      sourceId,
      error,
      graphData,
    };
  },
});
</script>

<template>
  <div class="fit column">
    <div class="col-auto row justify-end z-top">
      <ActionMenu
        v-if="useRange"
        icon="mdi-arrow-expand-vertical"
      >
        <template #menus>
          <GraphRangeSubmenu
            :layout="layout"
            :save="v => saveLayout(v)"
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
    </div>
    <div v-if="error" class="col row justify-center items-center text-h5 q-gutter-x-md">
      <q-icon name="warning" color="negative" />
      <div class="col-auto">
        {{ error }}
      </div>
    </div>
    <div v-else class="col">
      <GenericGraph
        ref="displayRef"
        :data="graphData"
        :layout="layout"
        :revision="revision"
        v-bind="$attrs"
      />
    </div>
  </div>
</template>
