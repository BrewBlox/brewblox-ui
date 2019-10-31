<script lang="ts">
import { Component } from 'vue-property-decorator';

import Unit, { prettify } from '@/helpers/units/Unit';
import { sparkStore } from '@/plugins/spark/store';

import ValEdit from './ValEdit';


@Component
export default class UnitValEdit extends ValEdit {
  prettify = prettify;

  field!: Unit;

  get inputListeners(): Mapped<Function> {
    const func = (v: any): void => {
      this.field.value = v;
      this.saveField(this.field);
    };
    return this.lazy
      ? { change: func }
      : { input: func };
  }

  get unitOpts(): { label: string; value: string }[] {
    const vals = Object.values(sparkStore.unitAlternatives(this.serviceId))
      .find(vals => vals.includes(this.field.unit)) || [];

    return vals.map(v => ({ label: prettify(v), value: v }));
  }
}
</script>

<template>
  <q-item v-if="editable" dark>
    <q-input
      :value="field.value"
      step="any"
      dark
      :dense="dense"
      :label="' '"
      type="number"
      class="q-mr-md"
      v-on="inputListeners"
    />
    <q-select
      :value="field.unit"
      :options="unitOpts"
      :display-value="field.notation"
      :dense="dense"
      :label="' '"
      dark
      options-dark
      emit-value
      @input="v => { field.unit = v; saveField(field); }"
    />
  </q-item>
  <div v-else>
    {{ field }}
  </div>
</template>
