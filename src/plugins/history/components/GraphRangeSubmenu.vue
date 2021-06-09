<script lang="ts">
import { Layout } from 'plotly.js';
import { defineComponent, PropType } from 'vue';

import { createDialog } from '@/utils/dialog';
import { deepCopy } from '@/utils/objects';

export default defineComponent({
  name: 'GraphRangeSubmenu',
  props: {
    layout: {
      type: Object as PropType<Partial<Layout>>,
      required: true,
    },
    save: {
      type: Function as PropType<(v: Partial<Layout>) => unknown>,
      required: true,
    },
  },
  setup(props) {

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
          modelValue: props.layout[key]?.range,
        },
      })
        .onOk(range =>
          props.save({
            ...deepCopy(props.layout),
            [key]: range
              ? { range, autorange: false }
              : undefined,
          }));
    }

    return {
      label,
      edit,
    };
  },
});
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
