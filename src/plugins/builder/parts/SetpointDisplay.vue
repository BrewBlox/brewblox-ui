<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { CENTER } from '@/plugins/builder/const';

import { usePart } from '../composables';
import { SCALE_KEY } from '../specs/SetpointDisplay';
import { FlowPart } from '../types';
import { liquidOnCoord, squares } from '../utils';

export default defineComponent({
  name: 'SetpointDisplay',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  setup(props) {
    const {
      bordered,
    } = usePart.setup(props.part);

    const scale = computed<number>(
      () => props.part.settings[SCALE_KEY] ?? 1,
    );

    const color = computed<string>(
      () => liquidOnCoord(props.part, CENTER)[0] ?? '',
    );

    return {
      squares,
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
        :width="squares(2)-2"
        :height="squares(1)-2"
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
