<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { deepCopy } from '@/helpers/functional';
import type { BlockAddress, BlockField } from '@/plugins/spark/types';


@Component
export default class ChangeFieldDialog extends DialogBase {
  local: any = null;

  @Prop({ type: Object, required: true })
  public readonly address!: BlockAddress;

  @Prop({ type: Object, required: true })
  public readonly field!: BlockField;

  @Prop({ required: true })
  public readonly value!: any;

  created(): void {
    this.local = deepCopy(this.value);
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
      <component
        :is="field.component"
        v-model="local"
        v-bind="field.componentProps"
        :service-id="address.serviceId"
        :block-id="address.id"
        editable
      />
      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
