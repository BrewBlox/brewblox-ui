<script lang="ts">
import get from 'lodash/get';
import { Component } from 'vue-property-decorator';

import { BEER, COLD_WATER, HOT_WATER, WORT } from '../getters';
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
    return get(this.part.settings, 'enabled', !!this.part.settings.pressure);
  }

  set pressured(enabled: boolean) {
    this.savePart({ ...this.part, settings: { ...this.part.settings, enabled } });
  }

  get color(): string | null {
    const [val] = this.part.settings.liquids || [null];
    return val || null;
  }

  set color(val: string | null) {
    const liquids = val ? [val] : [];
    this.savePart({ ...this.part, settings: { ...this.part.settings, liquids } });
  }
}
</script>

<template>
  <q-list dark>
    <q-separator dark />
    <q-item dark>
      <q-item-section>
        <q-item-label caption>
          Enabled
        </q-item-label>
        <q-toggle v-model="pressured" />
      </q-item-section>
      <q-item-section>
        <q-item-label caption>
          Liquid color
        </q-item-label>
        <ColorField
          v-model="color"
          title="Liquid color"
          message="Choose a fill color for this source."
        />
      </q-item-section>
      <q-item-section v-for="colorOpt in presetColors" :key="colorOpt">
        <q-btn
          :style="`background-color: ${colorOpt}`"
          :size="color == colorOpt ? 'lg' : 'md'"
          round
          icon="format_color_fill"
          class="q-mx-auto"
          @click="color = colorOpt"
        />
      </q-item-section>
    </q-item>
  </q-list>
</template>
