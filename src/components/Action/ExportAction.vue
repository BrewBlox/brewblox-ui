<script lang="ts">
import FileSaver from 'file-saver';
import { Component, Prop } from 'vue-property-decorator';

import { serialize } from '@/helpers/units/parseObject';

import CrudComponent from '../Widget/CrudComponent';

@Component
export default class ExportAction extends CrudComponent {

  @Prop({ type: String, default: 'mdi-file-export' })
  readonly icon!: string;

  @Prop({ type: String, default: 'Export widget' })
  readonly label!: string;

  get itemProps() {
    return {
      ...this.$attrs,
      ...this.$props,
    };
  }

  async showDialog() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, _rev, dashboard, pinnedPosition, ...exported } = this.widget;
    const blob = new Blob([JSON.stringify(serialize(exported))], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(blob, `brewblox-${this.widget.title}-${this.widget.feature}.json`);
  }
}
</script>

<template>
  <ActionItem v-bind="itemProps" @click="showDialog"/>
</template>
