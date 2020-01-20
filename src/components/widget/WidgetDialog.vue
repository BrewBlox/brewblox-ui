<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { Crud, featureStore, WidgetContext, WidgetMode } from '@/store/features';

@Component
export default class WidgetDialog extends DialogBase {

  // Objects directly passed into a dialog lose their reactivity
  // We can bypass this by passing a function that returns a reactive object
  @Prop({ type: Function, required: true })
  public readonly getCrud!: () => Crud;

  @Prop({ type: String, default: 'Full' })
  public readonly mode!: WidgetMode;

  @Prop({ type: Function, default: () => null })
  public readonly getProps!: () => any;

  @Prop({ type: Object, default: () => ({}) })
  public readonly listeners!: any;

  get context(): WidgetContext {
    return {
      mode: this.mode,
      container: 'Dialog',
    };
  }

  get crud(): Crud {
    return this.getCrud();
  }

  get widgetProps(): any {
    return this.getProps() || {};
  }

  get widgetComponent(): string {
    return featureStore.widget(this.crud);
  }
}
</script>

<template>
  <q-dialog ref="dialog" :maximized="$dense" no-backdrop-dismiss class="row" @hide="onDialogHide">
    <component
      :is="widgetComponent"
      :initial-crud="crud"
      :context="context"
      v-bind="widgetProps"
      v-on="listeners"
      @close="hide"
    />
  </q-dialog>
</template>
