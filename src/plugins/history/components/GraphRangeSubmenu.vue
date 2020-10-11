<script lang="ts">
import { Layout } from 'plotly.js';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { deepCopy } from '@/helpers/functional';


@Component
export default class GraphRangeSubmenu extends Vue {

  @Prop({ type: Object, required: true })
  public readonly layout!: Partial<Layout>;

  @Prop({ type: Function, required: true })
  public readonly save!: (v: Partial<Layout>) => void;

  label(side: 'Y1' | 'Y2'): string {
    const key = { Y1: 'yaxis', Y2: 'yaxis2' }[side];
    const obj = this.layout[key];
    const range = obj?.range ? `(${obj.range.join(', ')})` : 'auto';
    return `${side} range: ${range}`;
  }

  edit(side: 'Y1' | 'Y2'): void {
    const key = { Y1: 'yaxis', Y2: 'yaxis2' }[side];
    createDialog({
      component: 'GraphRangeDialog',
      title: `Set ${side} range`,
      value: this.layout[key]?.range,
    })
      .onOk(range =>
        this.save({
          ...deepCopy(this.layout),
          [key]: range
            ? { range, autorange: false }
            : undefined,
        }));
  }
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
