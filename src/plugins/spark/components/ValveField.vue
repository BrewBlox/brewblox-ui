<script lang="ts">
import isString from 'lodash/isString';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

import { spaceCased } from '@/helpers/functional';
import { ValveState } from '@/plugins/spark/features/MotorValve/types';
;

@Component
export default class ValveField extends Vue {

  @Prop({ required: true })
  readonly value!: ValveState;

  @Prop({ type: Boolean, default: false })
  readonly disable!: boolean;

  @Emit('input')
  change(val: ValveState) {
    return val;
  }

  get commonOpts() {
    return {
      color: 'grey-9',
      toggleColor: 'primary',
      textColor: 'grey',
      toggleTextColor: 'white',
    };
  }

  get options() {
    return Object.keys(ValveState)
      .filter(k => Number.isNaN(Number(k)))
      .map(key => ({
        ...this.commonOpts,
        label: spaceCased(key),
        value: ValveState[key],
      }));


    // return [
    //   {
    //     ...this.commonOpts,
    //     toggleTextColor: 'white',
    //     label: 'Off',
    //     value: ValveState.Inactive,
    //   },
    //   {
    //     ...this.commonOpts,
    //     toggleTextColor: 'white',
    //     label: 'On',
    //     value: ValveState.Active,
    //   },
    // ];
  }

  get known() {
    return !!this.options.find(opt => opt.value === this.value);
  }
}
</script>

<template>
  <q-btn-toggle :value="value" :options="options" :disable="disable" dense @input="change"/>
</template>
