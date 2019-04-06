<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { partSettings } from '@/plugins/spark/features/ProcessView/calculateFlows';
import { FlowPart } from '@/plugins/spark/features/ProcessView/state';
import { SQUARE_SIZE } from './getters';
import settings from './settings';
import { Coordinates } from '@/helpers/coordinates';
import { clampRotation } from '@/helpers/functional';

@Component({
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
})
export default class ProcessViewForm extends Vue {
  SQUARE_SIZE: number = SQUARE_SIZE; // make value accessible in template

  get part(): FlowPart {
    return this.$props.value;
  }

  get cards() {
    return [
      'PlacementPartCard',
      ...partSettings(this.part).cards,
    ];
  }

  get partSize(): [number, number] {
    return settings[this.part.type].size(this.part);
  }

  get rotatedSize(): [number, number] {
    const [x, y] = this.partSize;
    return (clampRotation(this.part.rotate) / 90) % 2
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

  get partViewBox(): string {
    /*
    * SVG viewBox accepts four arguments: startX, startY, sizeX, sizeY.
    * sizeX/Y should match the size of the component, regardless of any scaling.
    * startX/Y need to take into account that rotated parts may extend into negative coordinates.
    *
    * A square part rotated 180 deg will extend both to the left, and above its anchor square.
    * startX and startY should be placed at the left most position of the square.
    * They will never be > 0, as the anchor square is always [0,0].
    */

    const leftMost =
      new Coordinates(this.partSize)
        .rotate(this.part.rotate)
        .values()
        .map(v => Math.min(v, 0));

    return [
      ...leftMost,
      ...this.rotatedSize,
    ]
      .map(v => v * SQUARE_SIZE)
      .join(', ');
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <FormToolbar>{{ part.type }} {{ part.x }},{{ part.y }}</FormToolbar>

    <q-card-section>
      <q-item dark>
        <q-item-section>
          <svg
            :width="`${SQUARE_SIZE * displayScale * rotatedSize[0]}px`"
            :height="`${SQUARE_SIZE * displayScale * rotatedSize[1]}px`"
            :viewBox="partViewBox"
            class="q-mx-auto"
          >
            <ProcessViewItem :value="part"/>
          </svg>
        </q-item-section>
      </q-item>
      <component v-for="card in cards" :key="card" :is="card" :value="part" v-on="$listeners"/>
    </q-card-section>
  </q-card>
</template>
