<script lang="ts">
import { computed, defineComponent } from 'vue';

import { BEER, COLD_WATER, HOT_WATER, WORT } from '@/plugins/builder/const';
import { colorString } from '@/plugins/builder/utils';



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
  <div class="row">
    <ColorField
      v-model="color"
      clearable
      title="Liquid color"
      label="Custom"
      message="Select the fill color for this part."
      class="col-auto"
    />
    <div class="col-grow row justify-around">
      <q-btn
        v-for="colorOpt in presetColors"
        :key="colorOpt"
        :style="`background-color: ${colorOpt}`"
        :size="color == colorOpt ? 'lg' : 'md'"
        :color="colorOpt"
        round
        icon="format_color_fill"
        class="self-center"
        @click="toggle(colorOpt)"
      />
    </div>
  </div>
</template>
