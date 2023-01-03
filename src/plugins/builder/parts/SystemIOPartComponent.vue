<script lang="ts">
import { RIGHT } from '@/plugins/builder/const';
import {
  flowOnCoord,
  horizontalChevrons,
  liquidOnCoord,
} from '@/plugins/builder/utils';
import { computed, defineComponent } from 'vue';
import { usePart } from '../composables';

const chevrons = horizontalChevrons(15, 25);

export default defineComponent({
  name: 'SystemIOPartComponent',
  setup() {
    const { part, width, height, pressured } = usePart.setup();

    const flowSpeed = computed<number>(() => flowOnCoord(part.value, RIGHT));

    const liquids = computed<string[]>(() => liquidOnCoord(part.value, RIGHT));

    return {
      width,
      height,
      chevrons,
      pressured,
      flowSpeed,
      liquids,
    };
  },
});
</script>

<template>
  <svg
    v-bind="{ width, height }"
    viewBox="0 0 50 50"
  >
    <LiquidStroke
      :paths="['M30,25 H50']"
      :colors="liquids"
    />
    <AnimatedArrows
      :num-arrows="1"
      :speed="flowSpeed"
      path="M25,25 H50"
    />
    <g class="outline">
      <path
        v-if="flowSpeed > 0"
        :d="chevrons.right"
      />
      <path
        v-else-if="flowSpeed < 0"
        :d="chevrons.left"
      />
      <path
        v-else
        :d="chevrons.straight"
      />
      <path d="M30,21 H50" />
      <path d="M30,29 H50" />
    </g>
    <BuilderInteraction @interact="pressured = !pressured">
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <LiquidSourceMenuContent />
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
