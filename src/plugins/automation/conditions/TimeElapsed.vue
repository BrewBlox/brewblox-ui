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
  <q-list :class="{'darkish': !condition.enabled}" dense>
    <q-item>
      <q-item-section class="text-h6 text-italic">
        Wait for
      </q-item-section>
      <q-item-section class="col-auto">
        <q-toggle :value="condition.enabled" @input="saveEnabled">
          <q-tooltip>Toggle enabled</q-tooltip>
        </q-toggle>
      </q-item-section>
    </q-item>
    <q-item>
      <q-item-section>
        <InputField
          v-model="duration"
          label="Duration"
          title="Duration"
          class="q-mr-md"
        />
      </q-item-section>
    </q-item>
  </q-list>
</template>
