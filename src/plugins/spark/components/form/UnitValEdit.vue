<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator';

import Unit, { prettify } from '@/helpers/units/Unit';

import ValEditBase from '../ValEditBase';

@Component
export default class UnitValEdit extends ValEditBase {
  prettify = prettify;
  field!: Unit;
  local: number | null = null;

  @Prop({ type: Array, required: true })
  public readonly units!: string[];

  @Watch('local')
  updateField(newV: number | null): void {
    if (newV === null || !Number.isNaN(newV)) {
      this.field.value = newV;
    }
  }

  created(): void {
    this.local = this.field.value;
  }

  get unitOpts(): SelectOption[] {
    return this.units.map(v => ({ label: prettify(v), value: v }));
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
    />
    <q-select
      v-model="field.unit"
      :options="unitOpts"
      :display-value="field.notation"
      :dense="dense"
      emit-value
      class="col-auto"
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
