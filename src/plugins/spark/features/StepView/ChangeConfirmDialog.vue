<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';

@Component
export default class ChangeConfirmDialog extends DialogBase {
  local: any = null;

  @Prop({ type: String, required: true })
  public readonly serviceId!: string;

  @Prop({ type: String, required: true })
  public readonly blockId!: string;

  @Prop({ required: true })
  public readonly value!: any;

  @Prop({ type: String, required: true })
  public readonly fieldComponent!: string;

  @Prop({ type: Object, default: () => ({}) })
  public readonly componentProps!: any;

  @Prop({ type: String, default: 'Value' })
  public readonly label!: string;

  created() {
    this.local = this.value;
  }

  save() {
    this.onDialogOk(this.local);
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide" @keyup.enter="save">
    <q-card class="q-dialog-plugin q-dialog-plugin--dark" dark>
      <q-card-section class="q-dialog__title">{{ title }}</q-card-section>
      <q-card-section v-if="message" class="q-dialog__message scroll">{{ message }}</q-card-section>
      <q-card-section v-if="messageHtml" class="q-dialog__message scroll" v-html="messageHtml" />
      <q-card-section class="scroll">
        <component
          :is="fieldComponent"
          :service-id="serviceId"
          :block-id="blockId"
          v-bind="componentProps"
          v-model="local"
          editable
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
