<script lang="ts">
import { Component } from 'vue-property-decorator';

import { BEER, COLD_WATER, HOT_WATER, WORT } from '../getters';
import { colorString } from '../helpers';
import PartCard from './PartCard';

@Component
export default class ColorCard extends PartCard {
  presetColors = [
    COLD_WATER,
    HOT_WATER,
    BEER,
    WORT,
  ];

  get color(): string | null {
    return this.part.settings.color;
  }

  set color(val: string | null) {
    this.savePartSettings({ ...this.part.settings, color: colorString(val) });
  }

  toggle(color: string): void {
    this.color = color !== this.color ? color : null;
  }
}
</script>

<template>
  <q-list>
    <q-separator />
    <q-item>
      <q-item-section class="col-auto">
        <ColorField
          v-model="color"
          clearable
          title="Liquid color"
          label="Custom"
          message="Select the fill color for this part."
        />
      </q-item-section>
      <q-item-section v-for="colorOpt in presetColors" :key="colorOpt">
        <q-btn
          :style="`background-color: ${colorOpt}`"
          :size="color == colorOpt ? 'lg' : 'md'"
          round
          icon="format_color_fill"
          class="q-mx-auto"
          @click="toggle(colorOpt)"
        />
      </q-item-section>
    </q-item>
  </q-list>
</template>
