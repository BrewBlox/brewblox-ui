<script lang="ts">
import Component from 'vue-class-component';
import Vue from 'vue';
import { dashboardItemById } from '@/store/dashboards/getters';
import { serialize } from '@/helpers/units/parseObject';
import FileSaver from 'file-saver';

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
  $q: any;

  async showDialog() {
    const item = dashboardItemById(this.$store, this.$props.widgetId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, _rev, dashboard, ...exported } = item;
    const blob = new Blob([JSON.stringify(serialize(exported))], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(blob, `brewblox-${item.title}-${item.id}.json`);
  }
}
</script>

<template>
  <ActionItem v-bind="$props" @click="showDialog"/>
</template>
