<script lang="ts">
import { uid } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { sparkStore } from '@/plugins/spark/store';
import { Block, BlockCrud } from '@/plugins/spark/types';
import { Widget } from '@/store/dashboards';
import { featureStore, WidgetContext, WidgetMode } from '@/store/features';

@Component
export default class BlockWidgetDialog extends DialogBase {
  id = uid()
  localWidget: Widget | null = null;

  @Prop({ type: String, required: true })
  public readonly serviceId!: string;

  @Prop({ type: String, required: true })
  public readonly blockId!: string;

  @Prop({ type: String, default: 'Full' })
  public readonly mode!: WidgetMode;

  @Prop({ type: Function, default: () => null })
  public readonly getProps!: () => any;

  get block(): Block | null {
    return sparkStore.tryBlockById(this.serviceId, this.blockId);
  }

  get blockType(): string {
    return this.block ? this.block.type : '';
  }

  get widget(): Widget {
    return this.localWidget || {
      id: this.id,
      title: this.blockId,
      feature: this.blockType,
      dashboard: '',
      order: 0,
      config: {
        serviceId: this.serviceId,
        blockId: this.blockId,
      },
      ...featureStore.widgetSize(this.blockType),
    };
  }

  get crud(): BlockCrud {
    return {
      isStoreWidget: false,
      isStoreBlock: true,
      widget: this.widget,
      saveWidget: val => { this.localWidget = val; },
      block: this.block!,
      saveBlock: block => sparkStore.saveBlock(block),
      closeDialog: () => this.onDialogHide(),
    };
  }

  get context(): WidgetContext {
    return {
      container: 'Dialog',
      mode: this.mode,
      size: 'Fixed',
    };
  }

  get widgetComponent(): string {
    return featureStore.widgetComponent(this.crud);
  }

  get widgetProps(): any {
    return this.getProps() || {};
  }
}
</script>

<template>
  <q-dialog ref="dialog" :maximized="$dense" no-backdrop-dismiss class="row" @hide="onDialogHide">
    <component
      :is="widgetComponent"
      v-if="!!block"
      :initial-crud="crud"
      :context="context"
      v-bind="widgetProps"
      @close="hide"
    />
  </q-dialog>
</template>
