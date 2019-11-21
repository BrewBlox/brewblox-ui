<script lang="ts">
import { Component } from 'vue-property-decorator';

import Unit, { prettify } from '@/helpers/units/Unit';
import { sparkStore } from '@/plugins/spark/store';

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
    const vals =
      Object.values(sparkStore.unitAlternatives(this.serviceId)).find(vals => vals.includes(this.field.unit)) || [];

    return vals.map(v => ({ label: prettify(v), value: v }));
  }
}
</script>

<template>
  <q-item v-if="editable">
    <q-input
      :value="field.value"
      step="any"
      :dense="dense"
      :label="' '"
      type="number"
      class="q-mr-xs"
      v-on="inputListeners"
    />
    <q-select
      :value="field.unit"
      :options="unitOpts"
      :display-value="field.notation"
      :dense="dense"
      :label="' '"
      emit-value
      @input="v => { field.unit = v; saveField(field); }"
    />
  </q-item>
  <div v-else>
    {{ field }}
  </div>
</template>
