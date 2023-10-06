<script setup lang="ts">
import { GraphConfig, QueryParams } from '@/plugins/history/types';
import { emptyGraphConfig } from '@/plugins/history/utils';
import { isJsonEqual } from '@/utils/objects';
import cloneDeep from 'lodash/cloneDeep';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import { Layout } from 'plotly.js';
import { computed, PropType, ref, watch } from 'vue';

const props = defineProps({
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
});

const emit = defineEmits<{
  (e: 'update:modal', data: boolean): void;
  (e: 'update:config', data: Partial<GraphConfig>): void;
}>();

const sourceRevision = ref<Date>(new Date());

const graphConfig = computed<GraphConfig>(() => ({
  ...emptyGraphConfig(),
  ...props.config,
}));

const renderedConfig = ref<GraphConfig>(cloneDeep(graphConfig.value));

const graphTitle = computed<string>(() => {
  const actual = graphConfig.value.layout.title;
  if (isString(actual)) {
    return actual;
  }
  if (isObject(actual)) {
    return actual.text ?? '';
  }
  return '';
});

watch(
  () => graphConfig.value,
  (newV) => {
    if (!isJsonEqual(newV, renderedConfig.value)) {
      renderedConfig.value = cloneDeep(newV);
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
        :control-presets="!noDuration"
        control-range
        class="fit"
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
              :header="graphTitle"
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
