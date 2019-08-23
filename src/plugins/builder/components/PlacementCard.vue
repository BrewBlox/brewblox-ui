<script lang="ts">
import { Component } from 'vue-property-decorator';

import { clampRotation } from '@/helpers/functional';

import PartCard from './PartCard';

@Component
export default class PlacementCard extends PartCard {
  rotate(rotation: number) {
    const rotate = clampRotation(this.part.rotate + rotation);
    this.savePart({ ...this.part, rotate });
  }

  flip() {
    this.savePart({ ...this.part, flipped: !this.part.flipped });
  }
}
</script>

<template>
  <q-list dark>
    <q-separator dark />
    <q-item dark>
      <q-item-section>
        <q-btn
          color="primary"
          icon="mdi-rotate-left-variant"
          no-wrap
          label="rotate"
          @click="rotate(-90)"
        />
      </q-item-section>
      <q-item-section>
        <q-btn
          color="primary"
          icon="mdi-rotate-right-variant"
          no-wrap
          label="rotate"
          @click="rotate(90)"
        />
      </q-item-section>
      <q-item-section>
        <q-btn
          :label="part.flipped ? 'unflip' : 'flip'"
          color="primary"
          icon="mdi-swap-horizontal-bold"
          @click="flip"
        />
      </q-item-section>
      <q-item-section>
        <q-btn color="primary" icon="delete" label="delete" @click="removePart" />
      </q-item-section>
    </q-item>
  </q-list>
</template>
