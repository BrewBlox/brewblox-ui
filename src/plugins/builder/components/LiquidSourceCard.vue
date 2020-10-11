<script lang="ts">
import { Component } from 'vue-property-decorator';

import { BEER, COLD_WATER, HOT_WATER, WORT } from '../getters';
import { colorString } from '../helpers';
import PartCard from './PartCard';

@Component
export default class LiquidSourceCard extends PartCard {
  presetColors = [
    COLD_WATER,
    HOT_WATER,
    BEER,
    WORT,
  ];

  get pressured(): boolean {
    return this.part.settings.enabled ?? !!this.part.settings.pressure;
  }

  set pressured(enabled: boolean) {
    this.savePart({ ...this.part, settings: { ...this.part.settings, enabled } });
  }

  get color(): string | null {
    return this.part.settings.liquids?.[0] ?? null;
  }

  set color(val: string | null) {
    const liquids = val ? [colorString(val)] : [];
    this.savePart({ ...this.part, settings: { ...this.part.settings, liquids } });
  }

  toggle(color: string): void {
    this.color = color !== this.color ? color : null;
  }
}
</script>

<template>
  <div class="row">
    <LabeledField
      label="Enabled"
      class="col-auto min-width-sm"
    >
      <q-toggle v-model="pressured" dense />
    </LabeledField>
    <ColorField
      v-model="color"
      clearable
      title="Liquid color"
      label="Color"
      message="Choose a fill color for this source."
      class="col-auto"
    />
    <div class="col-grow row justify-around">
      <q-btn
        v-for="colorOpt in presetColors"
        :key="colorOpt"
        :style="`background-color: ${colorOpt}`"
        :size="color == colorOpt ? 'lg' : 'md'"
        round
        icon="format_color_fill"
        class="self-center"
        @click="toggle(colorOpt)"
      />
    </div>
  </div>
</template>
