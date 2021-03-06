<script lang="ts">
import cloneDeep from 'lodash/cloneDeep';
import defaults from 'lodash/defaults';
import { nanoid } from 'nanoid';
import { Layout } from 'plotly.js';
import { computed, defineComponent, nextTick, ref, watch } from 'vue';

import { useContext, useWidget } from '@/composables';
import { defaultPresets, emptyGraphConfig } from '@/plugins/history/getters';
import { GraphConfig, QueryParams } from '@/plugins/history/types';
import { Quantity } from '@/shared-types';
import { Widget } from '@/store/widgets';
import { createDialog } from '@/utils/dialog';
import { isJsonEqual } from '@/utils/objects';
import { bloxQty, durationString } from '@/utils/quantity';

import { addBlockGraph } from './utils';

export default defineComponent({
  name: 'GraphWidget',
  setup() {
    const {
      context,
      inDialog,
    } = useContext.setup();

    const {
      widget,
      config,
      saveWidget,
    } = useWidget.setup<Widget<GraphConfig>>();

    function cloned(): GraphConfig {
      return cloneDeep(defaults(config.value, emptyGraphConfig()));
    }

    const presets = defaultPresets();
    const renderedConfig = ref(cloned());
    const downsampling = ref<Mapped<string>>({});

    // Separate IDs for graphs in widget and dialog wrapper
    // This prevents source create/delete race conditions when switching
    const widgetGraphId = nanoid();
    const previewGraphId = nanoid();

    const previewGraphRef = ref();
    const widgetGraphRef = ref();

    const sourceRevision = ref<Date>(new Date());
    const renderRevision = ref<Date>(new Date());

    async function refresh(): Promise<void> {
      await nextTick();
      renderRevision.value = new Date();
    }

    async function regraph(): Promise<void> {
      await nextTick();
      renderedConfig.value = cloneDeep(config.value);
      sourceRevision.value = new Date();
    }

    const title = computed<string>(
      () => widget.value.title,
    );

    async function saveConfig(config: GraphConfig): Promise<void> {
      delete config.layout.title;
      saveWidget({ ...widget.value, config });
    }

    function isActivePreset(preset: QueryParams): boolean {
      return isJsonEqual(preset, config.value.params);
    }

    function saveParams(params: QueryParams): void {
      saveConfig({ ...config.value, params });
    }

    function saveLayout(layout: Partial<Layout>): void {
      saveConfig({ ...config.value, layout });
    }

    function chooseDuration(): void {
      const current = config.value.params.duration ?? '1h';
      createDialog({
        component: 'DurationQuantityDialog',
        componentProps: {
          modelValue: bloxQty(current),
          title: 'Custom graph duration',
          label: 'Duration',
        },
      })
        .onOk((v: Quantity) => saveParams({ duration: durationString(v) }));
    }

    function currentGraphId(): string | null {
      if (widgetGraphRef.value !== undefined) { return widgetGraphId; }
      if (previewGraphRef.value !== undefined) { return previewGraphId; }
      return null;
    }

    function showGraphDialog(): void {
      const currentId = currentGraphId();
      createDialog({
        component: 'GraphDialog',
        componentProps: {
          graphId: currentId || nanoid(),
          config: {
            ...config.value,
            layout: {
              ...config.value.layout,
              title: widget.value.title,
            },
          },
          sharedSources: currentId !== null,
          usePresets: true,
          saveParams,
        },
      });
    }

    function startAddBlockGraph(): void {
      addBlockGraph(widget.value.id, null);
    }

    watch(
      () => widget.value.config,
      (newV) => {
        if (!isJsonEqual(newV, renderedConfig.value)) {
          regraph();
        }
      },
    );

    return {
      context,
      inDialog,
      presets,
      downsampling,
      previewGraphId,
      widgetGraphId,
      previewGraphRef,
      widgetGraphRef,
      sourceRevision,
      renderRevision,
      widget,
      title,
      config,
      isActivePreset,
      saveConfig,
      saveParams,
      saveLayout,
      chooseDuration,
      regraph,
      refresh,
      showGraphDialog,
      startAddBlockGraph,
    };
  },
});
</script>

<template>
  <PreviewCard
    show-initial
    :enabled="inDialog && context.mode === 'Full'"
    :no-scroll="context.mode === 'Basic'"
    size="lg"
  >
    <template #preview>
      <HistoryGraph
        ref="previewGraphRef"
        :graph-id="previewGraphId"
        v-bind="{
          config,
          sourceRevision,
          renderRevision
        }"
        use-presets
        use-range
        @params="saveParams"
        @layout="saveLayout"
        @downsample="v => downsampling = v"
      />
    </template>

    <template #toolbar>
      <WidgetToolbar has-mode-toggle>
        <template #actions>
          <ActionItem icon="mdi-chart-line" label="Show maximized" @click="showGraphDialog" />
          <ActionItem icon="add" label="Add block to graph" @click="startAddBlockGraph" />
          <ExportGraphAction :config="config" :header="widget.title" />
          <ActionItem icon="refresh" label="Refresh" @click="regraph" />
        </template>
        <template #menus>
          <WidgetActions />
          <GraphRangeSubmenu
            :layout="config.layout"
            :save="v => saveLayout(v)"
          />
          <ActionSubmenu label="Timespan">
            <div class="row wrap" style="max-width: 200px">
              <q-btn
                v-for="(preset, idx) in presets"
                :key="idx"
                flat
                no-caps
                :label="preset.duration"
                :color="isActivePreset(preset) ? 'primary' : 'white'"
                class="col-6"
                @click="saveParams(preset)"
              />
              <q-btn
                flat
                no-caps
                label="Custom"
                class="col-6"
                @click="chooseDuration"
              />
            </div>
          </ActionSubmenu>
        </template>
      </WidgetToolbar>
    </template>

    <div
      v-if="context.mode === 'Basic'"
      v-touch-hold.mouse.stop="showGraphDialog"
      class="fit"
    >
      <q-resize-observer :debounce="200" @resize="refresh" />
      <HistoryGraph
        ref="widgetGraphRef"
        :graph-id="widgetGraphId"
        v-bind="{
          config,
          sourceRevision,
          renderRevision
        }"
        @downsample="v => downsampling = v"
      />
    </div>
    <div
      v-if="context.mode === 'Full'"
    >
      <GraphEditor
        :config="config"
        :downsampling="downsampling"
        @update:config="saveConfig"
      />
    </div>
  </PreviewCard>
</template>
