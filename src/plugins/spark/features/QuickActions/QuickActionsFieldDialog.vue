<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { deepCopy } from '@/helpers/units/parseObject';
import { BlockAddress } from '@/plugins/spark/types';

import { EditableFieldChange } from './types';


@Component
export default class QuickActionsFieldDialog extends DialogBase {
  local: any = null;

  @Prop({ type: Object, required: true })
  public readonly address!: BlockAddress;

  @Prop({ type: Object, required: true })
  public readonly field!: EditableFieldChange;

  created(): void {
    this.local = deepCopy(this.field.value);
  }

  save(): void {
    this.onDialogOk({
      ...this.field,
      value: this.local,
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
      <component
        :is="field.cfield.component"
        v-model="local"
        v-bind="field.cfield.componentProps"
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
