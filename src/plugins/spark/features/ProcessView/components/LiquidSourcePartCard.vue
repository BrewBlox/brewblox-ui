<script lang="ts">
import PartCard from './PartCard';
import Component from 'vue-class-component';
import { COLD_WATER, HOT_WATER, BEER, WORT } from '../getters';
import get from 'lodash/get';

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
  <q-card>
    <q-card-title>Liquid Source</q-card-title>
    <q-card-main>
      <div class="row justify-around">
        <q-checkbox :value="pressured" label="Pressured" size="lg" @input="togglePressure"/>
        <q-btn
          v-for="color in liquidColors"
          :key="color"
          :style="`background-color: ${color}`"
          :size="currentLiquids.includes(color) ? 'lg' : 'md'"
          round
          icon="format_color_fill"
          @click="changeLiquidSource(color)"
        />
      </div>
    </q-card-main>
  </q-card>
</template>
