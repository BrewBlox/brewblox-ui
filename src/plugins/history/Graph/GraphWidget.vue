<script lang="ts">
import cloneDeep from 'lodash/cloneDeep';
import defaults from 'lodash/defaults';
import { nanoid } from 'nanoid';
import { Layout } from 'plotly.js';
import { ComponentPublicInstance, computed, defineComponent, nextTick, reactive, ref, watch } from 'vue';

import { useWidget } from '@/composables';
import { defaultPresets, emptyGraphConfig } from '@/plugins/history/getters';
import { GraphConfig, QueryParams } from '@/plugins/history/types';
import { Widget } from '@/store/dashboards';
import { bloxQty, Quantity } from '@/utils/bloxfield';
import { createDialog } from '@/utils/dialog';
import { durationString } from '@/utils/duration';
import { isJsonEqual } from '@/utils/functional';

import { addBlockGraph } from './utils';

interface HistoryGraphApi extends ComponentPublicInstance {
  resetSources(): void;
  refresh(): void;
}

export default defineComponent({
  name: 'GraphWidget',
  props: {
    ...useWidget.props,
  },
  setup(props) {
    const {
      crud,
      mode,
      inDialog,
      toolbarComponent,
      saveWidget,
    } = useWidget.setup<GraphConfig>(props.crud, props.context);

    function cloned(): GraphConfig {
      return cloneDeep(defaults(crud.widget.config, emptyGraphConfig()));
    }

    const presets = defaultPresets();
    const config = reactive(cloned());
    const renderedConfig = ref(cloned());
    const downsampling = ref<Mapped<string>>({});

    // Separate IDs for graphs in widget and dialog wrapper
    // This prevents source create/delete race conditions when switching
    const widgetGraphId = nanoid();
    const wrapperGraphId = nanoid();

    const wrapperGraphRef = ref<HistoryGraphApi>();
    const widgetGraphRef = ref<HistoryGraphApi>();

    const widget = computed<Widget>(
      () => crud.widget,
    );

    const title = computed<string>(
      () => crud.widget.title,
    );

    async function saveConfig(config: GraphConfig): Promise<void> {
      delete config.layout.title;
      saveWidget({ ...crud.widget, config });
    }

    function isActivePreset(preset: QueryParams): boolean {
      return isJsonEqual(preset, config.params);
    }

    function saveParams(params: QueryParams): void {
      config.params = params;
      saveConfig(config);
    }

    function saveLayout(layout: Partial<Layout>): void {
      config.layout = layout;
      saveConfig(config);
    }

    function chooseDuration(): void {
      const current = config.params.duration ?? '1h';
      createDialog({
        component: 'DurationQuantityDialog',
        componentProps: {
          title: 'Custom graph duration',
          value: bloxQty(current),
          label: 'Duration',
        },
      })
        .onOk((v: Quantity) => saveParams({ duration: durationString(v) }));
    }

    async function regraph(): Promise<void> {
      await nextTick();
      renderedConfig.value = cloneDeep(config);
      widgetGraphRef.value?.resetSources();
      wrapperGraphRef.value?.resetSources();
    }

    async function refresh(): Promise<void> {
      await nextTick();
      widgetGraphRef.value?.refresh();
      wrapperGraphRef.value?.refresh();
    }

    function currentGraphId(): string | null {
      if (widgetGraphRef.value !== undefined) { return widgetGraphId; }
      if (wrapperGraphRef.value !== undefined) { return wrapperGraphId; }
      return null;
    }

    function showGraphDialog(): void {
      const currentId = currentGraphId();
      createDialog({
        component: 'GraphDialog',
        componentProps: {
          graphId: currentId || nanoid(),
          config: { ...config, layout: { ...config.layout, title: crud.widget.title } },
          sharedSources: currentId !== null,
          saveParams: v => saveParams(v),
        },
      });
    }

    function startAddBlockGraph(): void {
      addBlockGraph(crud.widget.id, null);
    }

    watch(
      () => crud.widget.config,
      (newV) => {
        if (!isJsonEqual(newV, renderedConfig.value)) {
          regraph();
        }
      },
    );

    return {
      mode,
      inDialog,
      toolbarComponent,
      presets,
      downsampling,
      wrapperGraphId,
      widgetGraphId,
      wrapperGraphRef,
      widgetGraphRef,
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
  <GraphCardWrapper
    show-initial
    :show="inDialog && mode === 'Full'"
    :no-scroll="mode === 'Basic'"
    v-bind="{context}"
  >
    <template #graph>
      <HistoryGraph
        ref="wrapperGraphRef"
        :graph-id="wrapperGraphId"
        :config="config"
        use-presets
        use-range
        @params="saveParams"
        @layout="saveLayout"
        @downsample="v => downsampling = v"
      />
    </template>

    <template #toolbar>
      <component :is="toolbarComponent" v-model:mode="mode" :crud="crud">
        <template #actions>
          <ActionItem icon="mdi-chart-line" label="Show maximized" @click="showGraphDialog" />
          <ActionItem icon="add" label="Add block to graph" @click="startAddBlockGraph" />
          <ExportGraphAction :config="config" :header="widget.title" />
          <ActionItem icon="refresh" label="Refresh" @click="regraph" />
        </template>
        <template #menus>
          <WidgetActions :crud="crud" />
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
      </component>
    </template>

    <div
      v-if="mode === 'Basic'"
      v-touch-hold.mouse.stop="showGraphDialog"
      class="fit"
    >
      <q-resize-observer :debounce="200" @resize="refresh" />
      <HistoryGraph
        ref="widgetGraphRef"
        :graph-id="widgetGraphId"
        :config="config"
        @downsample="v => downsampling = v"
      />
    </div>
    <div
      v-if="mode === 'Full'"
      class="widget-md"
    >
      <GraphEditor
        :config="config"
        :downsampling="downsampling"
        @update:config="saveConfig"
      />
    </div>
  </GraphCardWrapper>
</template>

<style lang="sass" scoped>
.card__Dashboard.card__dense
  height: 100vh !important
</style>
