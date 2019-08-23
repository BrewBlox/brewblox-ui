<script lang="ts">
import { Component } from 'vue-property-decorator';

import PartCard from './PartCard';

@Component
export default class ColorCard extends PartCard {

  get color(): string {
    return this.part.settings.color || '';
  }

  set color(color: string) {
    this.savePartSettings({ ...this.part.settings, color });
  }
}
</script>

<template>
  <q-list dark>
    <q-separator dark />
    <q-item dark>
      <q-item-section>
        <q-item-label caption>
          Liquid color
        </q-item-label>
        <ColorField
          v-model="color"
          title="Liquid color"
          message="Select the fill color for this part."
        />
      </q-item-section>
    </q-item>
  </q-list>
</template>
