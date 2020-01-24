<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';

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
  <q-dialog ref="dialog" :maximized="$dense" no-backdrop-dismiss @hide="onDialogHide">
    <CardWrapper no-scroll v-bind="{context}">
      <template #toolbar>
        <DialogToolbar icon="mdi-creation" title="Block wizard" />
      </template>
      <BlockWizard
        :service-id="serviceId"
        :initial-feature="initialFeature"
        :filter="filter"
        @close="onDialogHide"
        @created="onDialogOk"
      />
    </CardWrapper>
  </q-dialog>
</template>
