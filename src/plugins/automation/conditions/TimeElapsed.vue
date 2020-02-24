<script lang="ts">
import { Component } from 'vue-property-decorator';

import { durationMs, durationString } from '@/helpers/functional';

import { TimeElapsedImpl } from '../types';
import ConditionBase from './ConditionBase';

@Component
export default class TimeElapsed extends ConditionBase<TimeElapsedImpl> {

  get duration(): string {
    return durationString(this.impl.duration);
  }

  set duration(val: string) {
    this.impl.duration = durationMs(val);
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
    <InputField
      v-model="duration"
      label="Duration"
      title="Duration"
    />
  </div>
</template>
