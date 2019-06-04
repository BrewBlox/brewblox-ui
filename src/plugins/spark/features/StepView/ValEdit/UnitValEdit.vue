<script lang="ts">
import Component from 'vue-class-component';

import { prettify } from '@/helpers/units/Unit';
import sparkStore from '@/plugins/spark/store';

import ValEdit from './ValEdit';


@Component
export default class UnitValEdit extends ValEdit {
  prettify = prettify;

  get unitOpts(): { label: string; value: string }[] {
    const vals = Object.values(sparkStore.unitAlternatives(this.$props.serviceId))
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
      dense
      type="number"
      class="q-mr-md"
      @input="v => { field.value = v; saveField(field); }"
    />
    <q-select
      :value="field.unit"
      :options="unitOpts"
      :display-value="field.notation"
      dark
      dense
      options-dark
      emit-value
      @input="v => { field.unit = v; saveField(field); }"
    />
  </q-item>
  <div v-else>{{ field }}</div>
</template>
