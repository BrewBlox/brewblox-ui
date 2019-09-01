<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';
import { DashboardItem } from '@/store/dashboards';
import { featureStore } from '@/store/features';

import { Crud } from '../Widget/CrudComponent';

@Component
export default class FormDialog extends DialogBase {

  // Objects directly passed into a dialog lose their reactivity
  // We can bypass this by passing a function that returns a reactive object
  @Prop({ type: Function, required: true })
  public readonly getCrud!: () => Crud;

  @Prop({ type: Function, default: () => null })
  public readonly getProps!: () => any;

  @Prop({ type: Object, default: () => ({}) })
  public readonly listeners!: any;

  get crud(): Crud {
    return this.getCrud();
  }

  get formProps(): any {
    return this.getProps() || {};
  }

  get widget(): DashboardItem {
    return this.crud.widget;
  }

  get form(): string | undefined {
    return featureStore.formById(this.crud.widget.feature);
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss class="row" @hide="onDialogHide">
    <component :is="form" :crud="crud" v-bind="formProps" v-on="listeners" @close="hide" />
  </q-dialog>
</template>
