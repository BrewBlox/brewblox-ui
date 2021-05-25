<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { usePart } from '../composables';
import { FlowPart } from '../types';
import { coord2grid, textTransformation } from '../utils';

export default defineComponent({
  name: 'UrlDisplay',
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
      bordered,
    } = usePart.setup(props.part);

    const url = computed<string>(
      () => props.part.settings['url'] || '',
    );

    const titleText = computed<string>(
      () => props.part.settings['text'] || url.value || 'Url Display',
    );

    return {
      coord2grid,
      textTransformation,
      sizeX,
      sizeY,
      bordered,
      url,
      titleText,
    };
  },
});
</script>

<template>
  <g>
    <g class="outline">
      <rect
        v-show="bordered"
        :width="coord2grid(sizeX)-2"
        :height="coord2grid(sizeY)-2"
        x="1"
        y="1"
        rx="6"
        ry="6"
        stroke="white"
      />
    </g>
    <SvgEmbedded
      :transform="textTransformation(part, part.size, false)"
      :width="coord2grid(sizeX)"
      :height="coord2grid(sizeY)"
    >
      <div class="text-bold text-center q-mt-sm grid-label" style="text-decoration: underline; font-size: 130%">
        {{ titleText }}
      </div>
    </SvgEmbedded>
  </g>
</template>
