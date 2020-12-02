<script lang="ts">
import { debounce } from 'quasar';
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
    const val = this.part.settings[this.settingsKey];
    return (typeof val === 'number') ? val : this.defaultSize;
  }

  save(val: number): void {
    const size = (typeof val === 'number') ? val : this.defaultSize;
    this.savePartSettings({ ...this.part.settings, [this.settingsKey]: size });
  }

  debouncedSave = debounce(this.save, 50, true);
}
</script>

<template>
  <q-item class="q-ma-none q-mt-xs">
    <q-item-section>
      <q-item-label caption>
        {{ label }}
      </q-item-label>
      <q-slider :value="size" :min="min" :max="max" label @change="debouncedSave" />
    </q-item-section>
  </q-item>
</template>
