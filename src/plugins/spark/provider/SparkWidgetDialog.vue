<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { WidgetContext } from '@/store/features';


@Component
export default class SparkWidgetDialog extends DialogBase {

  @Prop({ type: String, required: true })
  public readonly serviceId!: string;

  get context(): WidgetContext {
    return {
      mode: 'Basic',
      container: 'Dialog',
    };
  }
}
</script>

<template>
  <q-dialog ref="dialog" :maximized="$q.screen.lt.md" no-backdrop-dismiss @hide="onDialogHide">
    <SparkWidget :service-id="serviceId" :context="context" class="bg-dark-bright" />
  </q-dialog>
</template>
