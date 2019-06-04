<script lang="ts">

import { Dialog } from 'quasar';
import Vue from 'vue';
import Component from 'vue-class-component';

import dashboardStore from '@/store/dashboards';

@Component({
  props: {
    widgetId: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: 'Rename Widget',
    },
    icon: {
      type: String,
      default: 'edit',
    },
    active: {
      type: Boolean,
      default: false,
    },
    noClose: {
      type: Boolean,
      default: false,
    },
  },
})
export default class RenameWidgetAction extends Vue {
  renameWidget() {
    let widgetTitle = dashboardStore.dashboardItemById(this.$props.widgetId).title;
    Dialog.create({
      title: 'Change Widget name',
      message: `Choose a new name for '${widgetTitle}'`,
      dark: true,
      cancel: true,
      prompt: {
        model: widgetTitle,
        type: 'text',
      },
    })
      .onOk(title => {
        const item = dashboardStore.dashboardItemById(this.$props.widgetId);
        dashboardStore.saveDashboardItem({ ...item, title });
      });
  }
}
</script>

<template>
  <ActionItem v-bind="$props" @click="renameWidget"/>
</template>
