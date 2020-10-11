<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '../DialogBase';


@Component
export default class SaveConfirmDialog extends DialogBase {

  @Prop({ type: String, default: 'Unsaved changes' })
  public readonly title!: string;

  @Prop({ type: String, default: 'Do you want to save your changes before closing?' })
  public readonly message!: string;

  @Prop({ type: Function, required: true })
  public readonly saveFunc!: () => unknown | Promise<unknown>;

  async done(save: boolean): Promise<void> {
    if (save) {
      await this.saveFunc();
    }
    this.onDialogOk();
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    no-backdrop-dismiss
    no-esc-dismiss
    @hide="onDialogHide"
  >
    <DialogCard v-bind="{title, message, html}">
      <template #actions>
        <q-btn flat label="Cancel" @click="onDialogCancel" />
        <q-space />
        <q-btn flat label="No" color="primary" @click="done(false)" />
        <q-btn flat label="Yes" color="primary" @click="done(true)" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
