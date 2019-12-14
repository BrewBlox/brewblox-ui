<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';

@Component
export default class TextAreaDialog extends DialogBase {
  local: string | null = null;

  @Prop({ type: String })
  public readonly value!: string;

  @Prop({ type: Boolean, default: true })
  public readonly autogrow!: boolean;

  @Prop({ type: Array, default: () => [] })
  public readonly rules!: InputRule[];

  @Prop({ type: String, default: 'Value' })
  public readonly label!: string;

  save(): void {
    this.onDialogOk(this.local);
  }

  created(): void {
    this.local = this.value;
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide" @keyup.ctrl.enter="save">
    <DialogCard v-bind="{title, message, html}">
      <q-input
        v-model="local"
        type="textarea"
        :rules="rules"
        :label="label"
        :autogrow="autogrow"
        autofocus
      />

      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
