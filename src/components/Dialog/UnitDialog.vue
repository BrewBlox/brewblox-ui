<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';
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
    <q-card class="q-dialog-plugin q-dialog-plugin--dark" dark>
      <q-card-section class="q-dialog__title">
        {{ title }}
      </q-card-section>
      <q-card-section v-if="message" class="q-dialog__message scroll">
        {{ message }}
      </q-card-section>
      <q-card-section v-if="messageHtml" class="q-dialog__message scroll" v-html="messageHtml" />
      <q-card-section class="scroll">
        <q-input
          v-model.number="local"
          :label="label"
          input-style="font-size: 170%"
          type="number"
          step="any"
          dark
          autofocus
          clearable
        >
          <template #append>
            {{ value.notation }}
          </template>
        </q-input>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
