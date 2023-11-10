<script setup lang="ts">
import cloneDeep from 'lodash/cloneDeep';
import defaults from 'lodash/defaults';
import { nanoid } from 'nanoid';
import { Layout } from 'plotly.js';
import { computed, nextTick, ref, watch } from 'vue';
import { GraphConfig, QueryParams } from '@/plugins/history/types';
import { emptyGraphConfig } from '@/plugins/history/utils';
import { useWidgetStore, Widget } from '@/store/widgets';
import { isJsonEqual } from '@/utils/objects';

const props = defineProps({
  routeId: {
    type: String,
    default: '',
  },
});

const widgetStore = useWidgetStore();

const widget = computed<Widget<GraphConfig> | null>(() =>
  widgetStore.widgetById(props.routeId),
);

const title = computed<string>(() => widget.value?.title ?? 'Unknown Graph');

function cloned(): GraphConfig {
  return widget.value != null
    ? cloneDeep(defaults(widget.value.config, emptyGraphConfig()))
    : emptyGraphConfig();
}

const sourceRevision = ref<Date>(new Date());
const renderRevision = ref<Date>(new Date());
const config = ref<GraphConfig>(cloned());
const graphId = nanoid();

async function saveConfig(config: GraphConfig): Promise<void> {
  if (widget.value) {
    widgetStore.saveWidget({ ...widget.value, config });
  }
}

async function saveParams(params: QueryParams): Promise<void> {
  await saveConfig({ ...config.value, params });
}

async function saveLayout(layout: Partial<Layout>): Promise<void> {
  await saveConfig({ ...config.value, layout });
}

async function regraph(): Promise<void> {
  await nextTick();
  config.value = cloned();
  sourceRevision.value = new Date();
}

watch(widget, (newV) => {
  if (newV && !isJsonEqual(newV.config, config.value)) {
    regraph();
  }
});
</script>

<template>
  <q-page class="page-height">
    <TitleTeleport>
      {{ title }}
    </TitleTeleport>
    <HistoryGraph
      v-bind="{
        config,
        graphId,
        sourceRevision,
        renderRevision,
      }"
      control-presets
      control-range
      teleport-controls
      class="fit"
      @params="saveParams"
      @layout="saveLayout"
    />
  </q-page>
</template>
