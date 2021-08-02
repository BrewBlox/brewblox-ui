<script lang="ts">
import { cloneDeep } from 'lodash';
import defaults from 'lodash/defaults';
import { nanoid } from 'nanoid';
import { computed, defineComponent, nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { emptyGraphConfig } from '@/plugins/history/const';
import { GraphConfig, QueryParams } from '@/plugins/history/types';
import { Widget, widgetStore } from '@/store/widgets';
import { isJsonEqual } from '@/utils/objects';


export default defineComponent({
  name: 'GraphPage',
  props: {
    routeId: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const router = useRouter();

    const widget = computed<Widget<GraphConfig> | null>(
      () => widgetStore.widgetById(props.routeId),
    );

    const title = computed<string>(
      () => widget.value?.title ?? 'Unknown Graph',
    );

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

    async function refresh(): Promise<void> {
      await nextTick();
      renderRevision.value = new Date();
    }

    async function regraph(): Promise<void> {
      await nextTick();
      config.value = cloned();
      sourceRevision.value = new Date();
    }

    function back(): void {
      router.back();
    }

    watch(
      () => widget.value,
      (newV) => {
        if (newV && !isJsonEqual(newV.config, config.value)) {
          regraph();
        }
      },
    );

    return {
      widget,
      config,
      title,
      graphId,
      sourceRevision,
      renderRevision,
      saveParams,
      refresh,
      back,
    };
  },
});
</script>

<template>
  <q-page class="page-height">
    <q-resize-observer :debounce="200" @resize="refresh" />
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
      use-presets
      use-range
      use-teleport
      maximized
      @params="saveParams"
    />
  </q-page>
</template>
