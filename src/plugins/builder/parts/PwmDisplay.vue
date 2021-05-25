<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { CENTER } from '@/plugins/builder/const';

import { usePart } from '../composables';
import { PWM_KEY } from '../specs/PwmDisplay';
import { FlowPart } from '../types';
import { liquidOnCoord } from '../utils';

export default defineComponent({
  name: 'PwmDisplay',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  setup(props) {
    const {
      scale,
    } = usePart.setup(props.part);

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
    <PwmValues :part="part" :settings-key="PWM_KEY" :color="color" />
  </g>
</template>
