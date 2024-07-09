<script setup lang="ts">
import { Quantity } from 'brewblox-proto/ts';
import { produce } from 'immer';
import { QTreeNode } from 'quasar';
import { computed, toRaw } from 'vue';
import { createDialog } from '@/utils/dialog';
import { bloxQty, durationString } from '@/utils/quantity';
import { DEFAULT_METRICS_DECIMALS, DEFAULT_METRICS_EXPIRY_MS } from '../const';
import { MetricsConfig } from '../types';

interface Props {
  config: MetricsConfig;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:config': [payload: MetricsConfig];
}>();

function updateConfig(
  cb: (draft: MetricsConfig) => void | MetricsConfig,
): void {
  const updated = produce(toRaw(props.config), cb);
  emit('update:config', updated);
}

const hideAfter = computed<Quantity>({
  get: () => bloxQty(props.config.params.duration ?? '10m'),
  set: (v) =>
    updateConfig((draft) => {
      draft.params.duration = durationString(v);
    }),
});

function editLeaf(node: QTreeNode): void {
  createDialog({
    component: 'MetricsDisplayDialog',
    componentProps: {
      config: props.config,
      title: node.value,
      field: node.value,
    },
  }).onOk((config) => emit('update:config', config));
}

function renamed(node: QTreeNode): string {
  return props.config.renames[node.value] || node.title;
}

function freshDuration(node: QTreeNode): string {
  return durationString(
    props.config.freshDuration[node.value] ?? DEFAULT_METRICS_EXPIRY_MS,
  );
}

function decimals(node: QTreeNode): number {
  return props.config.decimals[node.value] ?? DEFAULT_METRICS_DECIMALS;
}
</script>

<template>
  <QueryEditor
    :config="config"
    @update:config="(config) => emit('update:config', config)"
  >
    <template #settings>
      <DurationField
        v-model="hideAfter"
        label="Exclude metric values older than"
        class="col-grow"
      />
    </template>
    <template #leaf="{ node }">
      <div @click="editLeaf(node)">
        {{ node.label }}
        <q-tooltip>
          <i>Click to edit</i>
          <LabeledField
            :model-value="renamed(node)"
            label="Label"
            dense
            class="q-mt-sm"
          />
          <LabeledField
            :model-value="freshDuration(node)"
            label="Warn when older than"
            dense
            class="q-mt-sm"
          />
          <LabeledField
            :model-value="decimals(node)"
            label="Rounded decimals"
            dense
            class="q-mt-sm"
          />
        </q-tooltip>
      </div>
    </template>
  </QueryEditor>
</template>
