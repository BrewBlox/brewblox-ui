<script lang="ts">
import { Component } from 'vue-property-decorator';

import Unit, { prettify } from '@/helpers/units/Unit';

import { userUnitChoices } from '../../getters';
import ValEditBase from '../ValEditBase';

@Component
export default class UnitValEdit extends ValEditBase {
  prettify = prettify;

  field!: Unit;

  get inputListeners(): Mapped<Function> {
    const func = (v: number | null): void => {
      this.field.value = (v === null || Number.isNaN(v)) ? null : v;
      this.saveField(this.field);
    };
    return this.lazy ? { change: func } : { input: func };
  }

  get unitOpts(): { label: string; value: string }[] {
    const vals = Object.values(userUnitChoices)
      .find(vals => vals.includes(this.field.unit))
      ?? [];

    return vals.map(v => ({ label: prettify(v), value: v }));
  }
}
</script>

<template>
  <div v-if="editable" class="row no-wrap q-gutter-x-xs">
    <q-input
      :value="field.value"
      :dense="dense"
      inputmode="numeric"
      pattern="[0-9]*"
      class="col-grow"
      label="Value"
      v-on="inputListeners"
    />
    <q-select
      :value="field.unit"
      :options="unitOpts"
      :display-value="field.notation"
      :dense="dense"
      emit-value
      class="col-auto"
      @input="v => { field.unit = v; saveField(field); }"
    />
  </div>
  <div v-else>
    {{ field }}
  </div>
</template>
