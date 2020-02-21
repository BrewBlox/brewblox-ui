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
  <q-list :class="{'darkish': !condition.enabled}" dense>
    <q-item>
      <q-item-section class="text-h6 text-italic">
        Wait until
      </q-item-section>
      <q-item-section class="col-auto">
        <q-toggle :value="condition.enabled" @input="saveEnabled">
          <q-tooltip>Toggle enabled</q-tooltip>
        </q-toggle>
      </q-item-section>
    </q-item>
    <q-item>
      <q-item-section>
        <DatetimeField v-model="time" class="q-mr-md" />
      </q-item-section>
    </q-item>
  </q-list>
</template>
