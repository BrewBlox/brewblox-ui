<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { usePart } from '../composables';
import { FlowPart } from '../types';
import { coord2grid } from '../utils';


export default defineComponent({
  name: 'HeatingElement',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  setup(props) {
    const {
      sizeX,
    } = usePart.setup(props.part);

    const path = computed<string>(
      () => {
        const straight = coord2grid(sizeX.value - 2);
        return `M50,24.7h24c7.1,0,6.6-6.7,14-6.7 h${straight} c0,0,7,0.1,7,7 c0,7-7,7-7,7 H90`;
      },
    );

    return {
      path,
    };
  },
});
</script>

<template>
  <g>
    <PwmValues :part="part" settings-key="pwm" />
    <g class="outline">
      <path :d="path" />
    </g>
  </g>
</template>
