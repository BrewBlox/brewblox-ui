<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import ValEditBase from '../ValEditBase';


@Component
export default class DateValEdit extends ValEditBase {
  @Prop({ type: Number, default: 1 })
  readonly timeScale!: number;

  get scaledField(): number {
    return this.field * this.timeScale;
  }

  set scaledField(val: number) {
    this.saveField(Math.round(val / this.timeScale));
  }

  get displayVal(): string {
    return new Date(this.scaledField).toLocaleString();
  }

  created(): void {
    if (this.field === 0) {
      this.scaledField = new Date().getTime();
    }
  }
}
</script>

<template>
  <DatetimeField v-model="scaledField" :readonly="!editable" title="Start time" />
</template>
