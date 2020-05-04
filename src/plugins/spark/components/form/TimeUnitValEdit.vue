<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import { durationMs, durationString, unitDurationString } from '@/helpers/functional';
import Unit from '@/helpers/units/Unit';

import ValEditBase from '../ValEditBase';

@Component
export default class TimeUnitValEdit extends ValEditBase {
  field!: Unit;
  local: string | null = null;

  @Prop({ type: Array, required: true })
  public readonly units!: string[];

  created(): void {
    this.local = unitDurationString(this.field);
  }

  findUnit(s: string): string {
    const match = s.match(/^[0-9\.]*([a-z]*)/i);
    return match && match[1]
      ? match[1]
      : '';
  }

  get defaultUnit(): string {
    return !this.findUnit(this.local || '')
      ? this.findUnit(unitDurationString(this.value))
      : '';
  }

  get localNumber(): number {
    return durationMs(`${this.local}${this.defaultUnit}`);
  }

  normalize(): void {
    this.local = durationString(this.localNumber);
    this.field.value = this.localNumber;
    this.field.unit = 'ms';
  }
}
</script>

<template>
  <div v-if="editable" class="row no-wrap q-gutter-x-xs">
    <q-input
      v-model="local"
      label="Value"
      :suffix="defaultUnit"
      autofocus
      item-aligned
      class="col-grow"
      @change="normalize"
    />
  </div>
  <div
    v-else
    class="clickable q-pa-sm rounded-borders"
    @click="startEdit"
  >
    {{ field | unitDuration }}
  </div>
</template>
