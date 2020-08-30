<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import { shortDateString } from '@/helpers/functional';

import ValEditBase from '../ValEditBase';


@Component
export default class DateValEdit extends ValEditBase {

  @Prop({ type: Number, default: 1 })
  readonly timeScale!: number;

  created(): void {
    if (this.field === 0) {
      this.scaledField = new Date().getTime();
    }
  }

  get scaledField(): number {
    return this.field * this.timeScale;
  }

  set scaledField(val: number) {
    this.saveField(Math.round(val / this.timeScale));
  }

  get displayVal(): string {
    return shortDateString(this.scaledField);
  }
}
</script>

<template>
  <DatetimeField
    v-if="editable"
    v-model="scaledField"
    emit-number
  />
  <div
    v-else
    class="clickable q-pa-sm rounded-borders"
    @click="startEdit"
  >
    {{ displayVal }}
  </div>
</template>
