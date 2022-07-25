<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { usePart } from '../composables';
import { FlowPart } from '../types';
import { coord2grid, textTransformation } from '../utils';

export default defineComponent({
  name: 'LabelPartComponent',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  setup(props) {
    const { sizeX, sizeY } = usePart.setup(props.part);

    const text = computed<string>(
      () => props.part.settings.text || '<edit to set text>',
    );

    const fontSize = computed<number>(() => props.part.settings.fontSize || 16);

    return {
      textTransformation,
      coord2grid,
      sizeX,
      sizeY,
      text,
      fontSize,
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
      <div
        class="col-auto text-bold full-width q-pa-sm"
        :style="{ 'font-size': `${fontSize}pt` }"
      >
        {{ text }}
      </div>
    </SvgEmbedded>
  </g>
</template>
