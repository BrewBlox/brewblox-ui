<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { dashboardStore, Widget } from '@/store/dashboards';
import { Crud, featureStore, WidgetContext, WidgetMode } from '@/store/features';

@Component
export default class StoreWidgetDialog extends DialogBase {

  @Prop({ type: String, required: true })
  public readonly widgetId!: string;

  @Prop({ type: String, default: 'Full' })
  public readonly mode!: WidgetMode;

  @Prop({ type: Function, default: () => null })
  public readonly getProps!: () => any;

  get widget(): Widget {
    return dashboardStore.widgetById(this.widgetId)!;
  }

  get crud(): Crud {
    return {
      isStoreWidget: true,
      widget: this.widget,
      saveWidget: dashboardStore.saveWidget,
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
    return featureStore.widgetComponent(this.crud).component;
  }

  get widgetProps(): any {
    return this.getProps() ?? {};
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    :maximized="$dense"
    v-bind="dialogProps"
    class="row"
    @hide="onDialogHide"
  >
    <component
      :is="widgetComponent"
      v-if="!!widget"
      :initial-crud="crud"
      :context="context"
      v-bind="widgetProps"
      @close="hide"
    />
  </q-dialog>
</template>
