<script lang="ts">
import { Component } from 'vue-property-decorator';

import AutomationItemBase from '@/plugins/automation/components/AutomationItemBase';
import { TimeAbsoluteImpl } from '@/plugins/automation/types';


@Component
export default class TimeAbsolute extends AutomationItemBase<TimeAbsoluteImpl> {

  get time(): Date {
    return new Date(this.impl.time);
  }

  set time(val: Date) {
    this.impl.time = val.getTime();
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
    <DatetimeField v-model="time" />
  </div>
</template>
