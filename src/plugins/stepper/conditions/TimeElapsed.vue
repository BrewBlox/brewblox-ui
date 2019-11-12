<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { durationMs, durationString } from '@/helpers/functional';

import { StepCondition } from '../types';

interface TimeElapsedCondition extends StepCondition {
  opts: {
    duration: number;
  };
}

@Component
export default class TimeElapsed extends Vue {
  @Prop({ type: Object, required: true })
  public readonly condition!: TimeElapsedCondition;

  saveCondition(condition: TimeElapsedCondition = this.condition): void {
    this.$emit('update:condition', condition);
  }

  get duration(): string {
    return durationString(this.condition.opts.duration);
  }

  set duration(val: string) {
    this.condition.opts.duration = durationMs(val);
    this.saveCondition();
  }
}
</script>

<template>
  <q-list dark dense>
    <q-item dark>
      <q-item-section class="col-auto text-h6 text-italic">
        Wait for
      </q-item-section>
    </q-item>
    <q-item dark>
      <q-item-section class="col-auto">
        <InputField
          v-model="duration"
          title="Duration"
        />
      </q-item-section>
    </q-item>
  </q-list>
</template>
