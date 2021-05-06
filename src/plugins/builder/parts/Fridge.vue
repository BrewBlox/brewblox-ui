<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { usePart } from '../composables';
import { FlowPart } from '../types';
import { squares, textTransformation } from '../utils';

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
      squares,
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
        :width="squares(sizeX)-4"
        :height="squares(sizeY)-4"
        x="2"
        y="2"
        rx="8"
        ry="8"
        stroke-width="4px"
      />
      <!-- Top divider -->
      <line :x1="2" :y1="squares(1)" :x2="squares(sizeX)-4" :y2="squares(1)" />
      <!-- Bottom divider -->
      <line :x1="2" :y1="squares(sizeY-1)" :x2="squares(sizeX)-4" :y2="squares(sizeY-1)" />
      <!-- Shelf divider-->
      <line :x1="2" :y1="squares(shelfY)" :x2="squares(sizeX)-4" :y2="squares(shelfY)" />
    </g>
    <SvgEmbedded
      :transform="textTransformation(part, part.size, false)"
      :width="squares(sizeX)"
      :height="squares(sizeY)"
    >
      <div class="col-auto text-bold text-center q-pt-sm full-width" style="font-size: 130%">
        {{ titleText }}
      </div>
    </SvgEmbedded>
  </g>
</template>
