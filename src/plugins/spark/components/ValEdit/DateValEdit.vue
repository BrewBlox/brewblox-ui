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

  get displayVal() {
    return new Date(this.scaledField).toLocaleString();
  }

  saveScaledField(val: number) {
    this.saveField(val / this.timeScale);
  }
}
</script>

<template>
  <DatetimePopupEdit
    v-if="editable"
    :field="scaledField"
    :change="saveScaledField"
    label="Start time"
    tag="span"
  />
  <div v-else>{{ displayVal }}</div>
</template>
