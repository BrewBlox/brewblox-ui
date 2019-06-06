<script lang="ts">

import { Dialog } from 'quasar';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import dashboardStore from '@/store/dashboards';

@Component
export default class RenameWidgetAction extends Vue {

  @Prop({ type: String, required: true })
  readonly widgetId!: string;

  @Prop({ type: String, default: 'Rename Widget' })
  readonly label!: string;

  @Prop({ type: String, default: 'edit' })
  readonly icon!: string;

  @Prop({ type: Boolean, default: false })
  readonly active!: boolean;

  @Prop({ type: Boolean, default: false })
  readonly noClose!: boolean;

  @Prop({ type: Object, default: () => ({}) })
  readonly itemProps!: any;

  @Prop({ type: Boolean, default: false })
  readonly disabled!: boolean;

  renameWidget() {
    let widgetTitle = dashboardStore.dashboardItemById(this.widgetId).title;
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
        const item = dashboardStore.dashboardItemById(this.widgetId);
        dashboardStore.saveDashboardItem({ ...item, title });
      });
  }
}
</script>

<template>
  <ActionItem v-bind="$props" @click="renameWidget"/>
</template>
