<script lang="ts">
import get from 'lodash/get';
import Component from 'vue-class-component';

import { BEER, COLD_WATER, HOT_WATER, WORT } from '../getters';
import PartCard from './PartCard';

@Component
export default class LiquidSourcePartCard extends PartCard {
  get liquidColors() {
    return [
      COLD_WATER,
      HOT_WATER,
      BEER,
      WORT,
    ];
  }

  get pressured() {
    return Boolean(this.part.settings.pressure);
  }

  get currentLiquids() {
    return get(this.part.settings, 'liquids', []);
  }

  changeLiquidSource(liquidSource: string) {
    const liquids = [liquidSource];
    this.savePart({ ...this.part, settings: { ...this.part.settings, liquids } });
  }

  togglePressure(enabled: boolean) {
    const pressure = enabled ? 10 : 0;
    this.savePart({ ...this.part, settings: { ...this.part.settings, pressure } });
  }
}
</script>

<template>
  <q-list dark>
    <q-separator dark/>
    <q-item dark>
      <q-item-section>
        <q-item-label caption>Pressure</q-item-label>
        <q-toggle :value="pressured" @input="togglePressure"/>
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
