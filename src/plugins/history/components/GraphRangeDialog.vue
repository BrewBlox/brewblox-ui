<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';


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

  get valuesOk(): boolean {
    return this.minV < this.maxV;
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
    no-backdrop-dismiss
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{title, message, html}">
      <div class="row q-gutter-sm">
        <q-input
          v-model="minV"
          label="Lower bound"
          inputmode="numeric"
          pattern="[0-9]*"
          autofocus
          class="col"
          :rules="[
            v => v < maxV || 'Lower bound must be less than upper bound'
          ]"
        />
        <q-input
          v-model="maxV"
          label="Upper bound"
          inputmode="numeric"
          pattern="[0-9]*"
          class="col"
          :rules="[
            v => v > minV || 'Upper bound must be more than lower bound'
          ]"
        />
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
