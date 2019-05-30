<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

import { Unit } from '@/helpers/units';

import { BlockDataType } from './types';

@Component({
  props: {
    value: {
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
})
export default class StepViewValue extends Vue {
  get valType(): BlockDataType {
    return this.$props.type;
  }

  get field() {
    return this.$props.value;
  }

  set field(v: any) {
    console.log(v);
    this.$emit('input', v);
  }
}
</script>

<template>
  <q-item-section>
    <q-input v-if="valType === 'string'" v-model="field" dark/>
    <q-input
      v-else-if="valType === 'number'"
      v-model.number="field"
      type="number"
      step="any"
      dark
      dense
    />
    <q-toggle v-else-if="valType === 'boolean'" v-model="field" class="col"/>
    <q-item v-else-if="valType === 'Unit'" dark>
      <q-input
        :value="field.value"
        step="any"
        dark
        dense
        type="number"
        class="q-mr-md"
        @input="v => { field.value = v; field = field; }"
      />
      <q-input :value="field.unit" dark dense @input="v => { field.unit = v; field = field; }"/>
    </q-item>
  </q-item-section>
</template>
