<script setup lang="ts">
import { QTreeNode } from 'quasar';
import { createDialog } from '@/utils/dialog';
import { durationString } from '@/utils/quantity';
import { DEFAULT_METRICS_DECIMALS, DEFAULT_METRICS_EXPIRY_MS } from '../const';
import { MetricsConfig } from '../types';

interface Props {
  config: MetricsConfig;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:config': [payload: MetricsConfig];
}>();

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
