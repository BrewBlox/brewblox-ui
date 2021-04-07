<script lang="ts">
import isFinite from 'lodash/isFinite';
import { Component } from 'vue-property-decorator';

import { prettyUnit, Quantity } from '@/helpers/bloxfield';
import { createDialog } from '@/helpers/dialog';

import ValEditBase from '../ValEditBase';

@Component
export default class QuantityValEdit extends ValEditBase<Quantity> {
  local: number | null = null;

  syncField(): void {
    if (this.local === null || isFinite(this.local)) {
      this.field.value = this.local;
    }
  }

  created(): void {
    this.local = this.field.value;
  }

  get notation(): string {
    return prettyUnit(this.field);
  }

  showKeyboard(): void {
    createDialog({
      component: 'KeyboardDialog',
      value: this.local,
      type: 'number',
      suffix: this.notation,
    })
      .onOk(v => {
        this.local = v;
        this.syncField();
      });
  }
}
</script>

<template>
  <div v-if="editable" class="row no-wrap">
    <q-input
      v-model.number="local"
      :dense="dense"
      inputmode="numeric"
      pattern="[0-9]*"
      class="col-grow"
      label="Value"
      :suffix="notation"
      item-aligned
      @change="syncField"
    >
      <template #append>
        <KeyboardButton @click="showKeyboard" />
      </template>
    </q-input>
  </div>
  <div
    v-else
    class="clickable q-pa-sm rounded-borders"
    @click="startEdit"
  >
    {{ field | quantity }}
  </div>
</template>
