<script lang="ts">
import { PropType, computed, defineComponent } from 'vue';

import { CENTER } from '@/plugins/builder/const';

import { PWM_KEY } from '../blueprints/PwmDisplay';
import { usePart } from '../composables';
import { FlowPart } from '../types';
import { liquidOnCoord } from '../utils';

export default defineComponent({
  name: 'PwmDisplayPartComponent',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  setup(props) {
    const { scale } = usePart.setup(props.part);

    const color = computed<string>(
      () => liquidOnCoord(props.part, CENTER)[0] ?? '',
    );

    return {
      PWM_KEY,
      scale,
      color,
    };
  },
});
</script>

<template>
  <g :transform="`scale(${scale} ${scale})`">
    <PwmValues
      :part="part"
      :settings-key="PWM_KEY"
      :color="color"
    />
  </g>
</template>
