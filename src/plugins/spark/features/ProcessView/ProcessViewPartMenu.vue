<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { partSettings } from '@/plugins/spark/features/ProcessView/calculateFlows';
import { FlowPart } from '@/plugins/spark/features/ProcessView/state';
import { SQUARE_SIZE } from './getters';
import settings from './settings';
import { clampRotation } from '@/helpers/functional';

@Component({
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
})
export default class ProcessViewPartMenu extends Vue {
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
    <FormToolbar>{{ part.type }} {{ part.x }},{{ part.y }}</FormToolbar>

    <q-card-section>
      <q-item dark>
        <q-item-section>
          <svg
            :width="`${SQUARE_SIZE * displayScale * rotatedSize[0]}px`"
            :height="`${SQUARE_SIZE * displayScale * rotatedSize[1]}px`"
            :viewBox="`0, 0, ${SQUARE_SIZE * rotatedSize[0]}, ${SQUARE_SIZE * rotatedSize[1]}`"
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
