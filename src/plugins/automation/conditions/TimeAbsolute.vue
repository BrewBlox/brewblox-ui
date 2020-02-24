<script lang="ts">
import { Component } from 'vue-property-decorator';

import { TimeAbsoluteImpl } from '../types';
import ConditionBase from './ConditionBase';


@Component
export default class TimeAbsolute extends ConditionBase<TimeAbsoluteImpl> {

  get time(): Date {
    return new Date(this.impl.time);
  }

  set time(val: Date) {
    this.impl.time = val.getTime();
    this.saveCondition();
  }

  saveEnabled(value: boolean): void {
    this.condition.enabled = value;
    this.saveCondition();
  }
}
</script>

<template>
  <div class="column q-gutter-xs">
    <DatetimeField v-model="time" />
  </div>
</template>
