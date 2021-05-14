<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { usePart } from '../composables';
import { FlowPart } from '../types';
import { coord2grid, textTransformation } from '../utils';

export default defineComponent({
  name: 'UnknownPart',
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

    return {
      textTransformation,
      coord2grid,
      sizeX,
      sizeY,
    };
  },
});
</script>

<template>
  <g>
    <SvgEmbedded
      :transform="textTransformation(part, part.size, false)"
      :width="coord2grid(sizeX)"
      :height="coord2grid(sizeY)"
    >
      <div class="col text-bold text-h3 q-mt-xs">
        ?
      </div>
    </SvgEmbedded>
  </g>
</template>
