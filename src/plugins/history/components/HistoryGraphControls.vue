<script setup lang="ts">
import { QueryParams } from '../types';
import { defaultPresets } from '../utils';
import { isJsonEqual } from '@/utils/objects';
import cloneDeep from 'lodash/cloneDeep';
import { Layout } from 'plotly.js';

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

defineEmits<{
  'update:layout': [data: Partial<Layout>];
  'update:params': [data: QueryParams];
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
          @click="$emit('update:params', cloneDeep(preset))"
        />
      </ActionSubmenu>
    </template>
  </ActionMenu>
  <slot name="controls" />
</template>
