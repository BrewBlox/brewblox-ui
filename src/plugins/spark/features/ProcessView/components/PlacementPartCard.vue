<script lang="ts">
import PartCard from './PartCard';
import Component from 'vue-class-component';
import { clampRotation } from '@/helpers/functional';

@Component
export default class PlacementPartCard extends PartCard {
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
    <q-separator dark/>
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
        <q-btn disable color="primary" icon="mdi-swap-horizontal-bold" label="flip" @click="flip"/>
        <q-tooltip>Disabled until part flipping is fixed</q-tooltip>
      </q-item-section>
      <q-item-section>
        <q-btn color="primary" icon="delete" label="delete" @click="removePart"/>
      </q-item-section>
    </q-item>
  </q-list>
</template>
