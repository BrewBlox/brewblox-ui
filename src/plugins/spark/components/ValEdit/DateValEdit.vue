<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import ValEdit from './ValEdit';


@Component
export default class DateValEdit extends ValEdit {
  @Prop({ type: Number, default: 1 })
  readonly timeScale!: number;

  get scaledField() {
    return this.field * this.timeScale;
  }

  set scaledField(val: number) {
    this.saveField(Math.round(val / this.timeScale));
  }

  get displayVal() {
    return new Date(this.scaledField).toLocaleString();
  }
}
</script>

<template>
  <DatetimeField v-model="scaledField" :readonly="!editable" title="Start time" />
</template>
