<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';

@Component
export default class GraphAnnotationDialog extends DialogBase {
  local: string | null = null;

  @Prop({ type: String })
  public readonly value!: string;

  save(): void {
    this.onDialogOk({ text: this.local, remove: false });
  }

  remove(): void {
    this.onDialogOk({ text: this.local, remove: true });
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
        label="Title"
        autofocus
        item-aligned
      />
      <template #actions>
        <q-btn flat label="Remove" color="primary" @click="remove" />
        <q-space />
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
