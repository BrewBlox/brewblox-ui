<script lang="ts">
import { GraphConfig, QueryParams } from '@/plugins/history/types';
import { defaultPresets, emptyGraphConfig } from '@/plugins/history/utils';
import { deepCopy, isJsonEqual } from '@/utils/objects';
import { durationString } from '@/utils/quantity';
import { Layout } from 'plotly.js';
import { computed, defineComponent, PropType, ref, watch } from 'vue';

export default defineComponent({
  name: 'BlockGraph',
  props: {
    modal: {
      type: Boolean,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    config: {
      type: Object as PropType<Partial<GraphConfig>>,
      required: true,
    },
    noDuration: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modal', 'update:config'],
  setup(props, { emit }) {
    const presets: QueryParams[] = defaultPresets();
    const sourceRevision = ref<Date>(new Date());

    const graphConfig = computed<GraphConfig>(() => ({
      ...emptyGraphConfig(),
      ...props.config,
    }));
    const renderedConfig = ref<GraphConfig>(deepCopy(graphConfig.value));

    watch(
      () => graphConfig.value,
      (newV) => {
        if (!isJsonEqual(newV, renderedConfig.value)) {
          renderedConfig.value = deepCopy(newV);
          sourceRevision.value = new Date();
        }
      },
    );

    function save(cfg: GraphConfig): void {
      emit('update:config', { ...cfg });
    }

    const dialogOpen = computed<boolean>({
      get: () => props.modal,
      set: (v) => emit('update:modal', v),
    });

    const targetKeys = computed<string[][]>(() =>
      graphConfig.value.fields.map((key) => [
        key,
        graphConfig.value.renames[key] || key,
      ]),
    );

    function isRightAxis(key: string): boolean {
      return graphConfig.value.axes[key] === 'y2';
    }

    function axisLabel(key: string): string {
      return isRightAxis(key) ? 'Y2' : 'Y1';
    }

    function updateKeySide(key: string, isRight: boolean): void {
      graphConfig.value.axes[key] = isRight ? 'y2' : 'y';
      save(graphConfig.value);
    }

    function saveParams(params: QueryParams): void {
      graphConfig.value.params = params;
      save(graphConfig.value);
    }

    function saveLayout(layout: Partial<Layout>): void {
      graphConfig.value.layout = layout;
      save(graphConfig.value);
    }

    return {
      durationString,
      presets,
      sourceRevision,
      dialogOpen,
      graphConfig,
      targetKeys,
      isRightAxis,
      axisLabel,
      updateKeySide,
      saveParams,
      saveLayout,
    };
  },
});
</script>

<template>
  <q-dialog
    v-model="dialogOpen"
    transition-show="fade"
    maximized
  >
    <q-card
      v-if="dialogOpen"
      class="text-white"
    >
      <HistoryGraph
        :graph-id="id"
        :config="graphConfig"
        :source-revision="sourceRevision"
        :use-presets="!noDuration"
        use-range
        maximized
        @params="saveParams"
        @layout="saveLayout"
      >
        <template #controls>
          <q-btn-dropdown
            flat
            icon="settings"
            :auto-close="true"
          >
            <ExportGraphAction
              :config="graphConfig"
              :header="graphConfig.layout.title"
            />
            <q-expansion-item label="Display Axis">
              <q-item
                v-for="[key, renamed] in targetKeys"
                :key="key"
                :inset-level="0.2"
                clickable
                @click="updateKeySide(key, !isRightAxis(key))"
              >
                <q-item-section>{{ renamed }}</q-item-section>
                <q-item-section side>
                  {{ axisLabel(key) }}
                </q-item-section>
              </q-item>
            </q-expansion-item>
          </q-btn-dropdown>
          <DialogCloseButton />
        </template>
      </HistoryGraph>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="sass">
.mirrored
  -webkit-transform: scaleX(-1)
  transform: scaleX(-1)
</style>
