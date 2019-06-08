<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';
import { Block } from '@/plugins/spark/types';
import { DashboardItem } from '@/store/dashboards';
import featureStore from '@/store/features';

@Component
export default class BlockFormDialog extends DialogBase {

  @Prop({ type: Object, required: true })
  public readonly widget!: DashboardItem;

  @Prop({ type: Function, required: true })
  public readonly saveWidget!: (widget: DashboardItem) => void;

  @Prop({ type: Object, required: true })
  public readonly block!: Block;

  @Prop({ type: Function, required: true })
  public readonly saveBlock!: (block: Block) => void;

  @Prop({ type: Boolean, default: false })
  public readonly volatile!: boolean;

  get blockForm() {
    return featureStore.formById(this.block.type);
  }

  // saveBlock(block: Block) {
  //   sparkStore.saveBlock([this.block.serviceId, block])
  //     .catch(err => this.$q.notify(err.toString()));
  // }

  // saveWidget(widget: DashboardItem) {
  //   if (!this.volatile) {
  //     dashboardStore.saveDashboardItem(widget)
  //       .catch(err => this.$q.notify(err.toString()));
  //   }
  // }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <component
      :is="blockForm"
      :widget="widget"
      :block="block"
      :volatile="volatile"
      @update:block="saveBlock"
      @update:widget="saveWidget"
    />
  </q-dialog>
</template>
