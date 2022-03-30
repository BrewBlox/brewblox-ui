<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { CENTER } from '@/plugins/builder/const';

import { usePart } from '../composables';
import { FlowPart } from '../types';
import { coord2grid, liquidOnCoord } from '../utils';

export default defineComponent({
  name: 'SetpointDisplayPartComponent',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  setup(props) {
    const {
      scale,
      bordered,
    } = usePart.setup(props.part);

    const color = computed<string>(
      () => liquidOnCoord(props.part, CENTER)[0] ?? '',
    );

    return {
      coord2grid,
      bordered,
      scale,
      color,
    };
  },
});
</script>

<template>
  <g :transform="`scale(${scale} ${scale})`">
    <SetpointValues :part="part" settings-key="setpoint" />
    <g class="outline">
      <rect
        v-show="bordered"
        :width="coord2grid(2)-2"
        :height="coord2grid(1)-2"
        :stroke="color"
        stroke-width="2px"
        x="1"
        y="1"
        rx="6"
        ry="6"
      />
    </g>
  </g>
</template>
