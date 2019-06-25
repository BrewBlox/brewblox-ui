<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { clampRotation } from '@/helpers/functional';
import { partSpecs } from '@/plugins/spark/features/ProcessView/calculateFlows';
import { FlowPart } from '@/plugins/spark/features/ProcessView/types';

import { SQUARE_SIZE } from './getters';

@Component
export default class ProcessViewPartMenu extends Vue {
  SQUARE_SIZE: number = SQUARE_SIZE; // make value accessible in template

  @Prop({ type: Object, required: true })
  readonly part!: FlowPart;

  get cards() {
    return [
      'PlacementPartCard',
      ...partSpecs(this.part).cards,
    ];
  }

  get partSize(): [number, number] {
    return partSpecs(this.part).size(this.part);
  }

  get rotatedSize(): [number, number] {
    const [x, y] = this.partSize;
    return clampRotation(this.part.rotate) % 180
      ? [y, x]
      : [x, y];
  }

  get displayScale() {
    const maxSize = Math.max(...this.partSize);
    if (maxSize >= 6) {
      return 0.5;
    }
    if (maxSize >= 4) {
      return 1;
    }
    return 2;
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <DialogToolbar>{{ part.type }} {{ part.x }},{{ part.y }}</DialogToolbar>

    <q-card-section>
      <q-item dark>
        <q-item-section>
          <svg
            :width="`${SQUARE_SIZE * displayScale * rotatedSize[0]}px`"
            :height="`${SQUARE_SIZE * displayScale * rotatedSize[1]}px`"
            :viewBox="`0, 0, ${SQUARE_SIZE * rotatedSize[0]}, ${SQUARE_SIZE * rotatedSize[1]}`"
            class="q-mx-auto"
          >
            <ProcessViewItem :part="part"/>
          </svg>
        </q-item-section>
      </q-item>
      <component v-for="card in cards" :key="card" :is="card" :part="part" v-on="$listeners"/>
    </q-card-section>
  </q-card>
</template>
