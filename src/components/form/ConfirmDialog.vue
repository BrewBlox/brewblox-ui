<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '../DialogBase';


@Component
export default class ConfirmDialog extends DialogBase {

  @Prop({ type: String, default: 'OK' })
  public readonly ok!: string;

  @Prop({ type: [String, Boolean], default: true })
  public readonly cancel!: string | boolean;

  get cancelLabel(): string {
    return typeof this.cancel === 'string'
      ? this.cancel
      : 'Cancel';
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    v-bind="dialogProps"
    @hide="onDialogHide"
    @keyup.enter="onDialogOk()"
  >
    <DialogCard v-bind="{title, message, html}">
      <template #actions>
        <q-btn
          v-if="cancel"
          flat
          :label="cancelLabel"
          color="primary"
          @click="onDialogCancel"
        />
        <q-btn
          flat
          :label="ok"
          color="primary"
          @click="onDialogOk()"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
