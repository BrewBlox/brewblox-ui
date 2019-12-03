<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { roundNumber } from '@/helpers/functional';
import { Unit } from '@/helpers/units';

@Component
export default class UnitDialog extends DialogBase {
  local: number | null = null;

  @Prop({ type: Object, required: true, validator: v => v instanceof Unit })
  public readonly value!: Unit;

  @Prop({ type: Number, default: 2 })
  readonly decimals!: number;

  @Prop({ type: String, default: 'Value' })
  public readonly label!: string;

  created(): void {
    this.local = this.value.value !== null
      ? roundNumber(this.value.value, this.decimals)
      : null;
  }

  save(): void {
    this.onDialogOk(this.value.copy(this.local));
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide" @keyup.enter="save">
    <DialogCard v-bind="{title, message, html}">
      <q-input
        v-model.number="local"
        :label="label"
        :suffix="value.notation"
        input-style="font-size: 170%"
        type="number"
        step="any"
        autofocus
        clearable
        item-aligned
      />
      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
