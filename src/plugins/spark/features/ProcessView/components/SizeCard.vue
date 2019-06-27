<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import PartCard from './PartCard';

@Component
export default class SizeCard extends PartCard {

  @Prop({ type: String, required: true })
  public readonly settingsKey!: string;

  @Prop({ type: Number, required: true })
  public readonly defaultSize!: number;

  @Prop({ type: Number, required: true })
  public readonly min!: number;

  @Prop({ type: Number, required: true })
  public readonly max!: number;

  @Prop({ type: String, default: 'Size' })
  public readonly label!: string;

  get size(): number {
    return this.part.settings[this.settingsKey] || this.defaultSize;
  }

  set size(val: number) {
    const size = (val !== null)
      ? val
      : this.defaultSize;
    this.savePartSettings({ ...this.part.settings, [this.settingsKey]: size });
  }
}
</script>

<template>
  <q-list dark>
    <q-separator dark/>
    <q-item dark>
      <q-item-section>
        <q-item-label caption>{{ label }}</q-item-label>
        <q-slider v-model="size" :min="min" :max="max" dark label/>
      </q-item-section>
    </q-item>
  </q-list>
</template>
