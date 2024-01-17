<script setup lang="ts">
import cloneDeep from 'lodash/cloneDeep';
import { Layout } from 'plotly.js';
import { createDialog } from '@/utils/dialog';

interface Props {
  layout: Partial<Layout>;
  save: (v: Partial<Layout>) => unknown;
}

const props = defineProps<Props>();

function label(side: 'Y1' | 'Y2'): string {
  const key = { Y1: 'yaxis', Y2: 'yaxis2' }[side];
  const obj = props.layout[key];
  const range = obj?.range ? `(${obj.range.join(', ')})` : 'auto';
  return `${side} range: ${range}`;
}

function edit(side: 'Y1' | 'Y2'): void {
  const key = { Y1: 'yaxis', Y2: 'yaxis2' }[side];
  createDialog({
    component: 'GraphRangeDialog',
    componentProps: {
      title: `Set ${side} range`,
      value: props.layout[key]?.range,
    },
  }).onOk((range) =>
    props.save({
      ...cloneDeep(props.layout),
      [key]: range ? { range, autorange: false } : undefined,
    }),
  );
}
</script>

<template>
  <ActionSubmenu label="Y-axis range">
    <ActionItem
      :label="label('Y1')"
      icon="mdi-arrow-expand-vertical"
      @click="edit('Y1')"
    />
    <ActionItem
      :label="label('Y2')"
      icon="mdi-arrow-expand-vertical"
      style="color: #aef"
      @click="edit('Y2')"
    />
  </ActionSubmenu>
</template>
