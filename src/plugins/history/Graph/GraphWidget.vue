<script setup lang="ts">
import { useContext, useWidget } from '@/composables';
import { GraphConfig, QueryParams } from '@/plugins/history/types';
import { defaultPresets, emptyGraphConfig } from '@/plugins/history/utils';
import { Widget } from '@/store/widgets';
import { createDialog } from '@/utils/dialog';
import { isJsonEqual } from '@/utils/objects';
import { bloxQty, durationString } from '@/utils/quantity';
import { Quantity } from 'brewblox-proto/ts';
import cloneDeep from 'lodash/cloneDeep';
import defaults from 'lodash/defaults';
import { nanoid } from 'nanoid';
import { Layout } from 'plotly.js';
import { nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { addBlockGraph, selectSessionGraph } from './utils';

const router = useRouter();

const { context, inDialog } = useContext.setup();

const { widgetId, widget, config, patchWidget } =
  useWidget.setup<Widget<GraphConfig>>();

const presets = defaultPresets();
const renderedConfig = ref(
  cloneDeep(defaults(config.value, emptyGraphConfig())),
);

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

async function saveConfig(config: GraphConfig): Promise<void> {
  delete config.layout.title;
  patchWidget({ config });
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
  }).onOk((v: Quantity) => saveParams({ duration: durationString(v) }));
}

function showGraphPage(): void {
  router.push(`/graph/${widgetId}`);
}

function startAddBlockGraph(): void {
  addBlockGraph(widget.value.id, null);
}

async function startLoadSessionGraph(): Promise<void> {
  const noteConfig = await selectSessionGraph();
  if (noteConfig != null) {
    createDialog({
      component: 'ConfirmDialog',
      componentProps: {
        title: 'Import Session Graph',
        message: 'Are you sure you wish to replace the current graph config?',
      },
      noBackdropDismiss: true,
    }).onOk(() => saveConfig(noteConfig));
  }
}

watch(
  () => widget.value.config,
  (newV) => {
    if (!isJsonEqual(newV, renderedConfig.value)) {
      regraph();
    }
  },
);
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
          renderRevision,
        }"
        use-presets
        use-range
        class="fit"
        @params="saveParams"
        @layout="saveLayout"
      />
    </template>

    <template #toolbar>
      <WidgetToolbar has-mode-toggle>
        <template #actions>
          <ActionItem
            icon="mdi-chart-line"
            label="Show maximized"
            @click="showGraphPage"
          />
          <ActionItem
            icon="add"
            label="Add block to graph"
            @click="startAddBlockGraph"
          />
          <ActionItem
            icon="mdi-import"
            label="Import session graph"
            @click="startLoadSessionGraph"
          />
          <ExportGraphAction
            :config="config"
            :header="widget.title"
          />
          <ActionItem
            icon="refresh"
            label="Refresh"
            @click="regraph"
          />
        </template>
        <template #menus>
          <WidgetActions />
          <GraphRangeSubmenu
            :layout="config.layout"
            :save="(v) => saveLayout(v)"
          />
          <ActionSubmenu label="Timespan">
            <div
              class="row wrap"
              style="max-width: 200px"
            >
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

    <template v-if="context.mode === 'Basic'">
      <q-resize-observer
        :debounce="200"
        @resize="refresh"
      />
      <HistoryGraph
        ref="widgetGraphRef"
        :graph-id="widgetGraphId"
        class="fit"
        v-bind="{
          config,
          sourceRevision,
          renderRevision,
        }"
      />
    </template>

    <template v-if="context.mode === 'Full'">
      <GraphEditor
        :config="config"
        @update:config="saveConfig"
      />
    </template>
  </PreviewCard>
</template>
