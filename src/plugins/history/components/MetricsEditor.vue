<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { createDialog } from '@/utils/dialog';
import { durationString } from '@/utils/quantity';

import { DEFAULT_DECIMALS, DEFAULT_FRESH_DURATION } from '../Metrics/const';
import { MetricsConfig } from '../Metrics/types';

export default defineComponent({
  name: 'MetricsEditor',
  props: {
    config: {
      type: Object as PropType<MetricsConfig>,
      required: true,
    },
  },
  emits: ['update:config'],
  setup(props, { emit }) {

    function saveConfig(config: MetricsConfig): void {
      emit('update:config', config);
    }

    function editLeaf(node: QuasarNode): void {
      createDialog({
        component: 'MetricsDisplayDialog',
        componentProps: {
          config: props.config,
          title: node.value,
          field: node.value,
        },
      })
        .onOk(config => saveConfig(config));
    }

    function renamed(node: QuasarNode): string {
      return props.config.renames[node.value] || node.label;
    }

    function freshDuration(node: QuasarNode): string {
      return durationString(props.config.freshDuration[node.value] ?? DEFAULT_FRESH_DURATION);
    }

    function decimals(node: QuasarNode): number {
      return props.config.decimals[node.value] ?? DEFAULT_DECIMALS;
    }

    return {
      saveConfig,
      editLeaf,
      renamed,
      freshDuration,
      decimals,
    };
  },
});
</script>

<template>
  <QueryEditor :config="config" @update:config="saveConfig">
    <template #leaf="{node}">
      <div @click="editLeaf(node)">
        {{ node.label }}
        <q-tooltip>
          <i>Click to edit</i>
          <LabeledField :model-value="renamed(node)" label="Label" dense class="q-mt-sm" />
          <LabeledField :model-value="freshDuration(node)" label="Warn when older than" dense class="q-mt-sm" />
          <LabeledField :model-value="decimals(node)" label="Rounded decimals" dense class="q-mt-sm" />
        </q-tooltip>
      </div>
    </template>
  </QueryEditor>
</template>
