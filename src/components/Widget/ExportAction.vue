<script lang="ts">
import FileSaver from 'file-saver';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { serialize } from '@/helpers/units/parseObject';
import dashboardStore from '@/store/dashboards';

@Component
export default class ExportAction extends Vue {

  @Prop({ type: String, required: true })
  readonly widgetId!: string;

  @Prop({ type: String, default: 'mdi-file-export' })
  readonly icon!: string;

  @Prop({ type: String, default: 'Export widget' })
  readonly label!: string;

  @Prop({ type: Boolean, default: false })
  readonly noClose!: boolean;

  async showDialog() {
    const item = dashboardStore.dashboardItemById(this.widgetId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, _rev, dashboard, pinnedPosition, ...exported } = item;
    const blob = new Blob([JSON.stringify(serialize(exported))], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(blob, `brewblox-${item.title}-${item.id}.json`);
  }
}
</script>

<template>
  <ActionItem v-bind="$props" @click="showDialog"/>
</template>
