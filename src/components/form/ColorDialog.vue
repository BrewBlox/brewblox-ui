<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';

@Component
export default class ColorDialog extends DialogBase {
  local = '';

  @Prop({ type: String, required: true })
  public readonly value!: string;

  @Prop({ type: Boolean, default: false })
  public readonly clearable!: boolean;

  created(): void {
    this.local = this.value;
  }

  save(): void {
    this.onDialogOk(this.local);
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    no-backdrop-dismiss
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{title, message, html}">
      <q-color v-model="local" format-model="hex" />
      <template #actions>
        <q-btn color="primary" flat label="Cancel" @click="onDialogCancel" />
        <q-btn v-if="clearable" color="primary" flat label="Clear" @click="onDialogOk(null)" />
        <q-btn color="primary" flat label="OK" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
