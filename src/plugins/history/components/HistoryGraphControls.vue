<script setup lang="ts">
import { isJsonEqual } from '@/utils/objects';
import cloneDeep from 'lodash/cloneDeep';
import { Layout } from 'plotly.js';
import { PropType } from 'vue';
import { QueryParams } from '../types';
import { defaultPresets } from '../utils';

const props = defineProps({
  layout: {
    type: Object as PropType<Partial<Layout>>,
    required: true,
  },
  params: {
    type: Object as PropType<QueryParams>,
    required: true,
  },
  showRange: {
    type: Boolean,
    default: false,
  },
  showPresets: {
    type: Boolean,
    default: false,
  },
});

defineEmits<{
  (e: 'update:layout', data: Partial<Layout>): void;
  (e: 'update:params', data: QueryParams): void;
}>();

const presets = defaultPresets();

function isActivePreset(preset: QueryParams): boolean {
  return isJsonEqual(preset, props.params);
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
          @click="(v) => $emit('update:params', cloneDeep(v))"
        />
      </ActionSubmenu>
    </template>
  </ActionMenu>
  <slot name="controls" />
</template>
