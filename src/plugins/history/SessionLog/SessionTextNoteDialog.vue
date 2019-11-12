<script lang="ts">
import { Component, Prop, Ref } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { createDialog } from '@/helpers/dialog';

@Component
export default class SessionTextNoteDialog extends DialogBase {
  local: string | null = null;

  @Ref()
  readonly editor!: HTMLElement;

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

  insertDate(): void {
    createDialog({
      component: 'DatetimeDialog',
      title: 'Pick a date',
      parent: this,
      value: new Date(),
    })
      .onOk(date => {
        this.local += `[${date.toLocaleString(undefined, { weekday: 'short' })} ${date.toLocaleString()}] `;
        this.$nextTick(() => this.editor.focus());
      });
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <q-card class="q-dialog-plugin q-dialog-plugin--dark" dark>
      <q-card-section class="q-dialog__title ellipsis">
        {{ title }}
      </q-card-section>
      <q-card-section v-if="message" class="q-dialog__message scroll">
        {{ message }}
      </q-card-section>
      <q-card-section v-if="messageHtml" class="q-dialog__message scroll" v-html="messageHtml" />
      <q-card-section class="scroll">
        <textarea
          ref="editor"
          :value="local"
          class="full-width"
          style="min-height: 200px;"
          autofocus
          @change="ev => { local = ev.target.value; }"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Insert date" color="primary" @click="insertDate" />
        <q-space />
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
