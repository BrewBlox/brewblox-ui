<script lang="ts">
import range from 'lodash/range';
import { debounce } from 'quasar';
import { computed, defineComponent } from 'vue';

import PartCard from './PartCard';

@Component
export default class ScaleCard extends PartCard {

  @Prop({ type: String, default: 'scale' })
  public readonly settingsKey!: string;

  @Prop({ type: Array, required: true })
  public readonly defaultSize!: [number, number];

  @Prop({ type: Number, default: 1 })
  public readonly minSize!: number;

  @Prop({ type: Number, default: 15 })
  public readonly maxSize!: number;

  @Prop({ type: String, default: 'Scale' })
  public readonly label!: string;

  get scales(): number[] {
    const [defaultX, defaultY] = this.defaultSize;
    const [big, small] = defaultY > defaultX
      ? [defaultY, defaultX]
      : [defaultX, defaultY];

    // We only want scale values where both X and Y size are integer
    // Iterate between small === minSize and big === maxSize
    // Step size ensures small is integer
    // Filter all values where the scaled big is not integer
    return range(this.minSize, Math.floor(this.maxSize * (small / big)) + 1)
      .map(smallScaled => smallScaled / small)
      .filter(scale => (big * scale) % 1 === 0);
  }

  get index(): number {
    const scale = this.part.settings[this.settingsKey] ?? 1;
    const idx = this.scales.findIndex(v => v === scale);
    return Math.max(idx, 0);
  }

  save(idx: number): void {
    this.savePartSettings({ ...this.part.settings, [this.settingsKey]: this.scales[idx] });
  }

  debouncedSave = debounce(this.save, 50, true)
}
</script>

<template>
  <q-item class="q-ma-none q-mt-xs">
    <q-item-section>
      <q-item-label caption>
        {{ label }}
      </q-item-label>
      <q-slider
        :value="index"
        :min="0"
        :max="scales.length - 1"
        markers
        @change="debouncedSave"
      />
    </q-item-section>
  </q-item>
</template>
