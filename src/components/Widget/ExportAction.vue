<script lang="ts">
import FileSaver from 'file-saver';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { serialize } from '@/helpers/units/parseObject';
import dashboardStore from '@/store/dashboards';

@Component({
  props: {
    widgetId: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: 'mdi-file-export',
    },
    label: {
      type: String,
      default: 'Export widget',
    },
    noClose: {
      type: Boolean,
      default: false,
    },
  },
})
export default class ExportAction extends Vue {
  async showDialog() {
    const item = dashboardStore.dashboardItemById(this.$props.widgetId);
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
