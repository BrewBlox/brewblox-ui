<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { dashboardStore, PersistentWidget } from '@/store/dashboards';
import { Crud, featureStore, WidgetContext, WidgetMode } from '@/store/features';

@Component
export default class StoreWidgetDialog extends DialogBase {

  @Prop({ type: String, required: true })
  public readonly widgetId!: string;

  @Prop({ type: String, default: 'Full' })
  public readonly mode!: WidgetMode;

  @Prop({ type: Function, default: () => null })
  public readonly getProps!: () => any;

  get widget(): PersistentWidget {
    return dashboardStore.persistentWidgetById(this.widgetId);
  }

  get crud(): Crud {
    return {
      isStoreWidget: true,
      widget: this.widget,
      saveWidget: dashboardStore.savePersistentWidget,
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
  <q-dialog ref="dialog" :maximized="$dense" no-backdrop-dismiss class="row" @hide="onDialogHide">
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
