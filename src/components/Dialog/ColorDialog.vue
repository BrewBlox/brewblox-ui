<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';

@Component
export default class ColorDialog extends DialogBase {
  local: string = '';

  @Prop({ type: String, required: true })
  public readonly value!: string;

  @Prop({ type: Boolean, default: false })
  public readonly clearable!: boolean;

  created() {
    this.local = this.value;
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide" @keyup.enter="onDialogOk(local)">
    <q-card class="q-dialog-plugin q-dialog-plugin--dark" dark>
      <q-card-section class="q-dialog__title">{{ title }}</q-card-section>
      <q-card-section v-if="message" class="q-dialog__message scroll">{{ message }}</q-card-section>
      <q-card-section v-if="messageHtml" class="q-dialog__message scroll" v-html="messageHtml" />
      <q-card-section class="scroll">
        <q-color v-model="local" dark format-model="hex" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="primary" flat label="Cancel" @click="onDialogCancel" />
        <q-btn v-if="clearable" color="primary" flat label="Clear" @click="onDialogOk(null)" />
        <q-btn color="primary" flat label="OK" @click="onDialogOk(local)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
