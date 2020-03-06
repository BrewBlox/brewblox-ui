<script lang="ts">
import { Component } from 'vue-property-decorator';

import { durationMs, durationString } from '@/helpers/functional';
import AutomationItemBase from '@/plugins/automation/components/AutomationItemBase';
import { TimeElapsedImpl } from '@/plugins/automation/types';

@Component
export default class TimeElapsed extends AutomationItemBase<TimeElapsedImpl> {

  get duration(): string {
    return durationString(this.impl.duration);
  }

  set duration(val: string) {
    this.impl.duration = durationMs(val);
    this.save();
  }

  saveEnabled(value: boolean): void {
    this.item.enabled = value;
    this.save();
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
