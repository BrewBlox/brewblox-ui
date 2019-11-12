<script lang="ts">
import { uid } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { sparkStore } from '@/plugins/spark/store';
import { Block, BlockCrud } from '@/plugins/spark/types';
import { PersistentWidget } from '@/store/dashboards';
import { featureStore, WidgetContext, WidgetMode } from '@/store/features';

@Component
export default class BlockWidgetDialog extends DialogBase {
  id = uid()
  localWidget: PersistentWidget | null = null;

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

  get widget(): PersistentWidget {
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
      saveBlock: block => sparkStore.saveBlock([this.serviceId, block]),
      closeDialog: () => this.onDialogHide(),
    };
  }

  get context(): WidgetContext {
    return {
      container: 'Dialog',
      mode: this.mode,
    };
  }

  get widgetComponent(): string {
    return featureStore.widget(this.crud);
  }

  get widgetProps(): any {
    return this.getProps() || {};
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss class="row" @hide="onDialogHide">
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