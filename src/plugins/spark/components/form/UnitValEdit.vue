<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';

import { prettify, Qty } from '@/plugins/spark/bloxfield';

import ValEditBase from '../ValEditBase';

@Component
export default class UnitValEdit extends ValEditBase {
  prettify = prettify;
  field!: Qty;
  local: number | null = null;

  @Watch('local')
  updateField(newV: number | null): void {
    if (newV === null || !Number.isNaN(newV)) {
      this.field.value = newV;
    }
  }

  created(): void {
    this.local = this.field.value;
  }
}
</script>

<template>
  <div v-if="editable" class="row no-wrap q-gutter-x-xs">
    <q-input
      v-model.number="local"
      :dense="dense"
      inputmode="numeric"
      pattern="[0-9]*"
      class="col-grow"
      label="Value"
      :suffix="field.notation"
    />
  </div>
  <div
    v-else
    class="clickable q-pa-sm rounded-borders"
    @click="startEdit"
  >
    {{ field }}
  </div>
</template>
