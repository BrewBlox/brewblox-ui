<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '../DialogBase';


@Component
export default class ConfirmDialog extends DialogBase {

  @Prop({ type: String, default: 'OK' })
  public readonly ok!: string;

  @Prop({ type: [String, Boolean], default: false })
  public readonly nok!: string;

  @Prop({ type: [String, Boolean], default: true })
  public readonly cancel!: string | boolean;

  get cancelLabel(): string {
    return typeof this.cancel === 'string'
      ? this.cancel
      : 'Cancel';
  }

  get nokLabel(): string {
    return typeof this.nok === 'string'
      ? this.nok
      : 'No';
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    v-bind="dialogProps"
    @hide="onDialogHide"
    @keyup.enter="onDialogOk(true)"
  >
    <DialogCard v-bind="{title, message, html}">
      <template #actions>
        <q-btn
          v-if="cancel"
          flat
          :label="cancelLabel"
          :color="nok ? '' : 'primary'"
          @click="onDialogCancel"
        />
        <q-space v-if="nok" />
        <q-btn
          v-if="nok"
          flat
          :label="nokLabel"
          color="primary"
          @click="onDialogOk(false)"
        />
        <q-btn
          flat
          :label="ok"
          color="primary"
          @click="onDialogOk(true)"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
