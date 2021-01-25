<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '../DialogBase';


@Component
export default class ConfirmDialog extends DialogBase {

  @Prop({ type: String, default: 'OK' })
  public readonly ok!: string;

  @Prop({ type: [String, Boolean], default: true })
  public readonly cancel!: string | boolean;

  @Prop({ type: [String, Boolean], default: false })
  public readonly no!: string;

  get cancelLabel(): string {
    return typeof this.cancel === 'string'
      ? this.cancel
      : 'Cancel';
  }

  get noLabel(): string {
    return typeof this.no === 'string'
      ? this.no
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
          :color="no ? '' : 'primary'"
          @click="onDialogCancel"
        />
        <q-space v-if="no" />
        <q-btn
          v-if="no"
          flat
          :label="noLabel"
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
