<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';
import { Block } from '@/plugins/spark/types';
import { DashboardItem } from '@/store/dashboards';
import featureStore from '@/store/features';

@Component
export default class BlockFormDialog extends DialogBase {

  // Objects directly passed into a dialog lose their reactivity
  // We can bypass this by passing a function that returns a reactive object
  @Prop({ type: Function, required: true })
  public readonly getWidget!: () => DashboardItem;

  @Prop({ type: Function, required: true })
  public readonly saveWidget!: (widget: DashboardItem) => void;

  // Same as getWidget: take a function that returns a reactive object
  @Prop({ type: Function, required: true })
  public readonly getBlock!: () => Block;

  @Prop({ type: Function, required: true })
  public readonly saveBlock!: (block: Block) => void;

  @Prop({ type: Boolean, default: false })
  public readonly volatile!: boolean;

  get widget(): DashboardItem {
    return this.getWidget();
  }

  get block(): Block {
    return this.getBlock();
  }

  get blockForm() {
    return featureStore.formById(this.block.type);
  }
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
