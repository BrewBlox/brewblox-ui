<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';

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

  created(): void {
    this.local = this.value;
  }

  save(): void {
    this.onDialogOk(this.local);
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide" @keyup.enter="save">
    <DialogCard v-bind="{title, message, html}">
      <component
        :is="fieldComponent"
        v-model="local"
        :service-id="serviceId"
        :block-id="blockId"
        v-bind="componentProps"
        editable
      />
      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
