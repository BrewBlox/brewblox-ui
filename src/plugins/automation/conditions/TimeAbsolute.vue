<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { StepCondition } from '../types';

interface TimeAbsoluteCondition extends StepCondition {
  opts: {
    time: number;
  };
}

@Component
export default class TimeAbsolute extends Vue {
  @Prop({ type: Object, required: true })
  public readonly condition!: TimeAbsoluteCondition;

  saveCondition(condition: TimeAbsoluteCondition = this.condition): void {
    this.$emit('update:condition', condition);
  }

  get time(): Date {
    return new Date(this.condition.opts.time);
  }

  set time(val: Date) {
    this.condition.opts.time = val.getTime();
    this.saveCondition();
  }
}
</script>

<template>
  <q-list dark dense>
    <q-item dark>
      <q-item-section class="text-h6 text-italic">
        Wait until
      </q-item-section>
    </q-item>
    <q-item dark>
      <q-item-section class="col-auto">
        <DatetimeField v-model="time" />
      </q-item-section>
    </q-item>
  </q-list>
</template>
