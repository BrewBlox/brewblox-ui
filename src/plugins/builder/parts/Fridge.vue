<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { usePart } from '../composables';
import { FlowPart } from '../types';
import { coord2grid, textTransformation } from '../utils';

export default defineComponent({
  name: 'Fridge',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  setup(props) {
    const {
      sizeX,
      sizeY,
    } = usePart.setup(props.part);

    const titleText = computed<string>(
      () => props.part.settings.text || '',
    );

    const shelfY = computed<number>(
      () => props.part.settings.shelfY || 1,
    );

    return {
      textTransformation,
      coord2grid,
      titleText,
      shelfY,
      sizeX,
      sizeY,
    };
  },
});
</script>

<template>
  <g>
    <g class="outline">
      <rect
        :width="coord2grid(sizeX)-4"
        :height="coord2grid(sizeY)-4"
        x="2"
        y="2"
        rx="8"
        ry="8"
        stroke-width="4px"
      />
      <!-- Top divider -->
      <line :x1="2" :y1="coord2grid(1)" :x2="coord2grid(sizeX)-4" :y2="coord2grid(1)" />
      <!-- Bottom divider -->
      <line :x1="2" :y1="coord2grid(sizeY-1)" :x2="coord2grid(sizeX)-4" :y2="coord2grid(sizeY-1)" />
      <!-- Shelf divider-->
      <line :x1="2" :y1="coord2grid(shelfY)" :x2="coord2grid(sizeX)-4" :y2="coord2grid(shelfY)" />
    </g>
    <SvgEmbedded
      :transform="textTransformation(part, part.size, false)"
      :width="coord2grid(sizeX)"
      :height="coord2grid(sizeY)"
    >
      <div class="col-auto text-bold text-center q-pt-sm full-width" style="font-size: 130%">
        {{ titleText }}
      </div>
    </SvgEmbedded>
  </g>
</template>
