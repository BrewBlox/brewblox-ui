<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { createDialog } from '@/helpers/dialog';


@Component
export default class GraphRangeDialog extends DialogBase {
  minV: number = 0;
  maxV: number = 0;

  @Prop({ type: Array, default: () => [null, null] })
  public readonly value!: [number, number];

  created(): void {
    this.minV = this.value[0] ?? -10;
    this.maxV = this.value[1] ?? 20;
  }

  get minVRules(): InputRule[] {
    return [
      v => Number(v) < this.maxV || 'Lower bound must be less than upper bound',
    ];
  }

  get maxVRules(): InputRule[] {
    return [
      v => Number(v) > this.minV || 'Upper bound must be more than lower bound',
    ];
  }

  get valuesOk(): boolean {
    return this.minV < this.maxV;
  }

  showMinVKeyboard(): void {
    createDialog({
      component: 'KeyboardDialog',
      value: this.minV,
      rules: this.minVRules,
      type: 'number',
    })
      .onOk(v => this.minV = v);
  }

  showMaxVKeyboard(): void {
    createDialog({
      component: 'KeyboardDialog',
      value: this.maxV,
      rules: this.maxVRules,
      type: 'number',
    })
      .onOk(v => this.maxV = v);
  }

  save(): void {
    if (this.valuesOk) {
      this.onDialogOk([this.minV, this.maxV]);
    }
  }

  clear(): void {
    this.onDialogOk(null);
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    v-bind="dialogProps"
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{title, message, html}">
      <div class="row q-gutter-sm">
        <q-input
          v-model.number="minV"
          label="Lower bound"
          inputmode="numeric"
          pattern="[0-9]*"
          autofocus
          class="col"
          :rules="minVRules"
        >
          <template #append>
            <KeyboardButton @click="showMinVKeyboard" />
          </template>
        </q-input>
        <q-input
          v-model.number="maxV"
          label="Upper bound"
          inputmode="numeric"
          pattern="[0-9]*"
          class="col"
          :rules="maxVRules"
        >
          <template #append>
            <KeyboardButton @click="showMaxVKeyboard" />
          </template>
        </q-input>
      </div>
      <template #actions>
        <q-btn flat label="Auto" color="primary" @click="clear" />
        <q-space />
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn :disable="!valuesOk" flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
