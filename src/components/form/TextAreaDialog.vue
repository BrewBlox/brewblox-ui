<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { createDialog } from '@/helpers/dialog';

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

  showKeyboard(): void {
    createDialog({
      component: 'KeyboardDialog',
      value: this.local,
      rules: this.rules,
    })
      .onOk(v => this.local = v);
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    v-bind="dialogProps"
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{title, message, html}">
      <q-input
        v-model="local"
        type="textarea"
        :rules="rules"
        :label="label"
        :autogrow="autogrow"
        autofocus
        @keyup.enter.exact.stop
        @keyup.enter.shift.stop
      >
        <template #append>
          <KeyboardButton @click="showKeyboard" />
        </template>
      </q-input>

      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
