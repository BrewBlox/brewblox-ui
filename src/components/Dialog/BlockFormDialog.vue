<script lang="ts">
import { uid } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';
import { BlockCrud } from '@/plugins/spark/components/BlockCrudComponent';
import { sparkStore } from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';
import { DashboardItem } from '@/store/dashboards';
import { featureStore } from '@/store/features';

@Component
export default class BlockFormDialog extends DialogBase {
  id = uid()
  localWidget: DashboardItem | null = null;

  @Prop({ type: String, required: true })
  public readonly serviceId!: string;

  @Prop({ type: String, required: true })
  public readonly blockId!: string;

  @Prop({ type: Function, default: () => null })
  public readonly getProps!: () => any;

  get block(): Block | null {
    return sparkStore.tryBlockById(this.serviceId, this.blockId);
  }

  get blockType(): string {
    return this.block ? this.block.type : '';
  }

  get widget(): DashboardItem {
    return this.localWidget || {
      id: uid(),
      title: this.blockId,
      feature: this.blockType,
      dashboard: '',
      order: 0,
      config: {
        serviceId: this.serviceId,
        blockId: this.blockId,
      },
      ...featureStore.widgetSizeById(this.blockType),
    };
  }

  get crud(): BlockCrud | null {
    return this.block
      ? {
        widget: this.widget,
        isStoreWidget: false,
        saveWidget: v => { this.localWidget = v; },
        block: this.block,
        isStoreBlock: true,
        saveBlock: v => sparkStore.saveBlock([this.serviceId, v]),
        closeDialog: () => this.hide(),
      }
      : null;
  }

  get form(): string | undefined {
    return featureStore.formById(this.blockType);
  }

  get formProps(): any {
    return this.getProps() || {};
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss class="row" @hide="onDialogHide">
    <component :is="form" v-if="!!crud" :crud="crud" v-bind="formProps" @close="hide" />
  </q-dialog>
</template>
