<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';

@Component
export default class BlockWizardDialog extends DialogBase {
  @Prop({ type: String, required: true })
  public readonly serviceId!: string;
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <BlockWizard :service-id="serviceId" @close="onDialogHide"/>
  </q-dialog>
</template>
