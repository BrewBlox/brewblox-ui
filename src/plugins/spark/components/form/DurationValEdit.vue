<script lang="ts">
import { Component } from 'vue-property-decorator';

import { isQuantity, Quantity } from '@/helpers/bloxfield';
import { durationMs, durationString } from '@/helpers/duration';

import ValEditBase from '../ValEditBase';

@Component
export default class DurationValEdit extends ValEditBase {
  field!: Quantity | string;
  local: string | null = '';

  created(): void {
    this.local = durationString(this.field);
  }

  findUnit(s: string | null): string {
    if (!s) { return ''; }
    const match = s.match(/^[0-9\.]*([a-z]*)/i);
    return match && match[1]
      ? match[1]
      : '';
  }

  get fallbackUnit(): string {
    return this.findUnit(this.local)
      ? ''
      : this.findUnit(durationString(this.value));
  }

  get localMs(): number {
    return this.local
      ? durationMs(`${this.local}${this.fallbackUnit}`)
      : 0;
  }

  normalize(): void {
    this.local = durationString(this.localMs);
    if (isQuantity(this.field)) {
      this.field.value = this.localMs;
      this.field.unit = 'ms';
    }
    else {
      this.field = this.local;
    }
  }
}
</script>

<template>
  <div v-if="editable" class="row no-wrap q-gutter-x-xs">
    <q-input
      v-model="local"
      label="Duration"
      :suffix="fallbackUnit"
      autofocus
      item-aligned
      clearable
      class="col-grow"
      @change="normalize"
    />
  </div>
  <div
    v-else
    class="clickable q-pa-sm rounded-borders"
    @click="startEdit"
  >
    {{ field | duration }}
  </div>
</template>
