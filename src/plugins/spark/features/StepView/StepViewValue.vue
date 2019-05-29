<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

import { Unit } from '@/helpers/units';

import { BlockDataType } from './types';

interface Parser {
  in: (val: any) => any;
  out: (val: any) => any;
}

@Component({
  props: {
    value: {
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
  },
})
export default class StepViewValue extends Vue {
  defaultParser: Parser = { in: v => v, out: v => v };
  parsers: Record<BlockDataType, Parser> = {
    string: this.defaultParser,
    number: this.defaultParser,
    boolean: this.defaultParser,
    Unit: {
      in: ([val, unit]: [number, string]) => new Unit(val, unit),
      out: (v: Unit) => [v.value, v.unitNotation],
    },
  };

  get valType(): BlockDataType {
    return this.$props.type;
  }

  get parsed() {
    return this.parsers[this.valType].in(this.$props.value);
  }

  set parsed(v: any) {
    this.$emit('input', this.parsers[this.valType].out(v));
  }
}
</script>

<template>
  <q-item-section class="justify-center">
    <q-input v-if="valType === 'string'" v-model="parsed" :label="label" dark/>
    <q-input
      v-else-if="valType === 'number'"
      v-model="parsed"
      :label="label"
      type="number"
      step="any"
      dark
    />
    <q-input
      v-else-if="valType === 'Unit'"
      :value="parsed.value"
      :label="label"
      step="any"
      dark
      @input="v => { parsed.value = v; parsed = parsed; }"
    >
      <template v-slot:append>{{ parsed.notation }}</template>
    </q-input>
    <q-toggle v-else-if="valType === 'boolean'" v-model="parsed" :label="$props.label" class="col"/>
  </q-item-section>
</template>
