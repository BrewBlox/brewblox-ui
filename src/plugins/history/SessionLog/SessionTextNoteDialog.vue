<script lang="ts">
import { QInput } from 'quasar';
import { Component, Prop, Ref } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { createDialog } from '@/helpers/dialog';

@Component
export default class SessionTextNoteDialog extends DialogBase {
  local: string | null = null;

  @Ref()
  readonly editor!: QInput;

  @Prop({ type: String })
  public readonly value!: string;

  save(): void {
    this.onDialogOk(this.local);
  }

  created(): void {
    this.local = this.value;
    if (this.local.length && this.local.charAt(this.local.length - 1) !== '\n') {
      this.local += '\n';
    }
  }

  showKeyboard(): void {
    createDialog({
      component: 'KeyboardDialog',
      value: this.local,
    })
      .onOk(v => this.local = v);
  }

  insertDate(): void {
    createDialog({
      component: 'DatetimeDialog',
      title: 'Pick a date',
      value: new Date(),
    })
      .onOk(date => {
        // Get the textarea wrapped by the q-input
        const native = this.editor.$el.querySelector('textarea');
        const prev = this.local!;

        // We want to mirror ctrl+v behaviour
        // Insert at cursor, overwrite any selection
        const [start, end] = native !== null
          ? [native.selectionStart, native.selectionEnd]
          : [prev.length, prev.length];

        // [Fri 11/15/2019, 2:00:23 PM]
        const day = date.toLocaleString(undefined, { weekday: 'short' });
        const insert = `[${day} ${date.toLocaleString()}] `;

        // Splice into current string
        this.local = [
          prev.slice(0, start),
          insert,
          prev.slice(end, prev.length),
        ].join('');

        // We lost focus when pressing the button
        // Reset focus to the editor, at the correct position
        this.$nextTick(() => {
          if (native !== null) {
            this.editor.focus();
            native.selectionStart = start + insert.length;
            native.selectionEnd = start + insert.length;
          }
        });
      });
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
      <q-input
        ref="editor"
        v-model="local"
        type="textarea"
        label="Note"
        autogrow
        autofocus
        item-aligned
        @keyup.enter.exact.stop
        @keyup.enter.shift.stop
      >
        <template #append>
          <KeyboardButton @click="showKeyboard" />
        </template>
      </q-input>
      <template #actions>
        <q-btn flat label="Insert date" color="primary" @click="insertDate" />
        <q-space />
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
