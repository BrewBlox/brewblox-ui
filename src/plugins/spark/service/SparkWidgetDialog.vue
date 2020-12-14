<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { WidgetContext } from '@/store/features';

import SparkWidget from './SparkWidget.vue';

@Component({
  components: {
    SparkWidget,
  },
})
export default class SparkWidgetDialog extends DialogBase {

  @Prop({ type: String, required: true })
  public readonly serviceId!: string;

  get context(): WidgetContext {
    return {
      mode: 'Basic',
      container: 'Dialog',
      size: 'Fixed',
    };
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    :maximized="$dense"
    no-backdrop-dismiss
    @hide="onDialogHide"
  >
    <SparkWidget :service-id="serviceId" :context="context" />
  </q-dialog>
</template>
