<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { createDialog } from '@/utils/dialog';

import { DEFAULT_PRECISION } from '../const';
import { GraphConfig } from '../types';

export default defineComponent({
  name: 'GraphEditor',
  props: {
    downsampling: {
      type: Object as PropType<Mapped<string>>,
      default: () => ({}),
    },
    noPeriod: {
      type: Boolean,
      default: false,
    },
    config: {
      type: Object as PropType<GraphConfig>,
      required: true,
    },
  },
  emits: ['update:config'],
  setup(props, { emit }) {

    function saveConfig(config: GraphConfig): void {
      emit('update:config', config);
    }

    function editLeaf(node: QuasarNode): void {
      createDialog({
        component: 'GraphDisplayDialog',
        componentProps: {
          config: props.config,
          field: node.value,
          title: node.value,
        },
      })
        .onOk(config => saveConfig(config));
    }

    return {
      DEFAULT_PRECISION,
      saveConfig,
      editLeaf,
    };
  },
});
</script>

<template>
  <div>
    <GraphPeriodEditor
      v-if="!noPeriod"
      :config="config"
      :downsampling="downsampling"
      @update:config="saveConfig"
    />
    <QueryEditor :config="config" @update:config="saveConfig">
      <template #leaf="{node}">
        <div @click="editLeaf(node)">
          {{ node.label }}
          <q-tooltip class="q-gutter-y-sm">
            <i>Click to edit</i>
            <LabeledField
              :model-value="config.renames[node.value] || node.label"
              label="Label"
              dense
            />
            <LabeledField
              :model-value="config.precision[node.value] || DEFAULT_PRECISION"
              label="Decimals in label"
              dense
            />
            <ColorField
              :model-value="config.colors[node.value] || ''"
              label="Color"
              null-text="automatic"
              readonly
              dense
            />
            <LabeledField
              :model-value="config.axes[node.value] === 'y2' ? 'Y2' : 'Y1'"
              label="Axis"
              dense
            />
          </q-tooltip>
        </div>
      </template>
    </QueryEditor>
  </div>
</template>
