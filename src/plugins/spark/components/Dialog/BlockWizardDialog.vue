<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';

@Component
export default class BlockWizardDialog extends DialogBase {
  @Prop({ type: String, required: true })
  public readonly serviceId!: string;

  @Prop({ type: String })
  public readonly initialFeature!: string;

  @Prop({ type: Function })
  public readonly filter!: (feature: string) => boolean;
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <BlockWizard
      :service-id="serviceId"
      :initial-feature="initialFeature"
      :filter="filter"
      @close="onDialogHide"
      @created="onDialogOk"
    />
  </q-dialog>
</template>
