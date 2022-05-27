<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { colorString } from '@/plugins/builder/utils';

import { usePart } from '../composables';
import { FlowPart } from '../types';

const paths = {
  edge: `
        M24,34
        v36.3
        c0,2.1-1,3.8-2.3,3.8
        H3.3
        C2,74,1,72.3,1,70.3
        V34
        c0-5,5.6-10,5.6-14.7
        L7.6,1
        h9.9
        l0.9,18.3
        C18.4,24,24,29,24,34
        z`,
  liquid: `
          M5,70
          V34
          c0-1.5,1.2-3.6,2.4-5.6
          c1.5-2.7,3.2-5.7,3.3-9
          L11.4,5
          h2.3
          l0.7,14.4
          c0,3.3,1.8,6.3,3.3,9
          c1.2,2,2.4,4.1,2.4,5.6
          v36
          H5
          z`,
};

export default defineComponent({
  name: 'BeerBottlePartComponent',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  setup(props) {
    const { scale } = usePart.setup(props.part);

    const color = computed<string>(() =>
      colorString(props.part.settings.color),
    );

    return {
      paths,
      color,
      scale,
    };
  },
});
</script>

<template>
  <g :transform="`scale(${scale} ${scale})`">
    <g transform="translate(5, 24)">
      <path
        :d="paths.liquid"
        :fill="color"
        :stroke="color"
      />
      <g class="outline">
        <path :d="paths.edge" />
      </g>
    </g>
  </g>
</template>
