<script lang="ts">
import get from 'lodash/get';
import { Component } from 'vue-property-decorator';

import { BEER, COLD_WATER, HOT_WATER, WORT } from '../getters';
import PartCard from './PartCard';

@Component
export default class LiquidSourceCard extends PartCard {
  get liquidColors(): string[] {
    return [
      COLD_WATER,
      HOT_WATER,
      BEER,
      WORT,
    ];
  }

  get pressured(): boolean {
    return get(this.part.settings, 'enabled', !!this.part.settings.pressure);
  }

  get currentLiquids(): string[] {
    return get(this.part.settings, 'liquids', []);
  }

  changeLiquidSource(liquidSource: string): void {
    const liquids = [liquidSource];
    this.savePart({ ...this.part, settings: { ...this.part.settings, liquids } });
  }

  toggle(enabled: boolean): void {
    this.savePart({ ...this.part, settings: { ...this.part.settings, enabled } });
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
        <q-toggle :value="pressured" @input="toggle" />
      </q-item-section>
      <q-item-section v-for="color in liquidColors" :key="color">
        <q-btn
          :style="`background-color: ${color}`"
          :size="currentLiquids.includes(color) ? 'lg' : 'md'"
          :disable="!pressured"
          round
          icon="format_color_fill"
          class="q-mx-auto"
          @click="changeLiquidSource(color)"
        />
      </q-item-section>
    </q-item>
  </q-list>
</template>
