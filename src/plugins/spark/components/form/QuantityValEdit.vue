<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';

import { bloxQty, prettify, Quantity } from '@/helpers/bloxfield';

import ValEditBase from '../ValEditBase';

@Component
export default class QuantityValEdit extends ValEditBase {
  field!: Quantity;
  local: Quantity | null = null;

  @Watch('local')
  updateField(newV: number | null): void {
    if (newV === null || !Number.isNaN(newV)) {
      this.field.value = newV;
    }
  }

  created(): void {
    this.local = bloxQty(this.field);
  }

  get notation(): string {
    return prettify(this.field);
  }
}
</script>

<template>
  <div v-if="editable" class="row no-wrap q-gutter-x-xs">
    <q-input
      v-model.number="local.value"
      :dense="dense"
      inputmode="numeric"
      pattern="[0-9]*"
      class="col-grow"
      label="Value"
      :suffix="notation"
    />
  </div>
  <div
    v-else
    class="clickable q-pa-sm rounded-borders"
    @click="startEdit"
  >
    {{ field | quantity }}
  </div>
</template>
