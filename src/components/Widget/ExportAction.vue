<script lang="ts">
import Component from 'vue-class-component';
import Vue from 'vue';
import { dashboardItemById } from '@/store/dashboards/getters';
import { serialize } from '@/helpers/units/parseObject';

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
  },
})
export default class ExportAction extends Vue {
  $q: any;

  async showDialog() {
    const item = dashboardItemById(this.$store, this.$props.widgetId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, _rev, dashboard, ...exported } = item;
    this.$q.dialog({
      message: JSON.stringify(serialize(exported)),
    });
  }
}
</script>

<template>
  <ActionItem :icon="$props.icon" :label="$props.label" @click="showDialog"/>
</template>
