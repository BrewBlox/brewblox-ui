<script setup lang="ts">
import { Quantity } from 'brewblox-proto/ts';
import cloneDeep from 'lodash/cloneDeep';
import { Layout } from 'plotly.js';
import { createDialog } from '@/utils/dialog';
import { isJsonEqual } from '@/utils/objects';
import { bloxQty, durationString } from '@/utils/quantity';
import { QueryParams } from '../types';
import { defaultPresets } from '../utils';

interface Props {
  layout: Partial<Layout>;
  params: QueryParams;
  showRange?: boolean;
  showPresets?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showRange: false,
  showPresets: false,
});

const emit = defineEmits<{
  'update:layout': [payload: Partial<Layout>];
  'update:params': [payload: QueryParams];
}>();

const presets = defaultPresets();

function isActivePreset(preset: QueryParams): boolean {
  return isJsonEqual(preset, props.params);
}

function chooseDuration(): void {
  const current = props.params.duration ?? '1h';
  createDialog({
    component: 'DurationDialog',
    componentProps: {
      modelValue: bloxQty(current),
      title: 'Custom graph duration',
      label: 'Duration',
    },
  }).onOk((v: Quantity) =>
    emit('update:params', { duration: durationString(v) }),
  );
}
</script>

<template>
  <ActionMenu
    v-if="showRange"
    icon="mdi-arrow-expand-vertical"
    class="col-auto"
  >
    <template #menus>
      <GraphRangeSubmenu
        :layout="layout"
        :save="(v) => $emit('update:layout', cloneDeep(v))"
      />
    </template>
  </ActionMenu>
  <ActionMenu
    v-if="showPresets"
    icon="mdi-timelapse"
    class="col-auto"
  >
    <template #menus>
      <ActionSubmenu label="Presets">
        <ActionItem
          v-for="(preset, idx) in presets"
          :key="`preset-${idx}`"
          :active="isActivePreset(preset)"
          :label="`${preset.duration}`"
          @click="$emit('update:params', cloneDeep(preset))"
        />
        <ActionItem
          label="Custom"
          @click="chooseDuration"
        />
      </ActionSubmenu>
    </template>
  </ActionMenu>
  <slot name="controls" />
</template>
