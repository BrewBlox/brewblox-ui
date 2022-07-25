<script lang="ts">
import { colorString } from '@/plugins/builder/utils';
import { computed, defineComponent, PropType } from 'vue';
import { usePart } from '../composables';
import { FlowPart } from '../types';

export default defineComponent({
  name: 'KegPartComponent',
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
      scale,
      color,
    };
  },
});
</script>

<template>
  <g :transform="`scale(${scale} ${scale})`">
    <rect
      :fill="color"
      x="10"
      y="60"
      width="80"
      height="178"
    />
    <g class="outline">
      <rect
        x="10"
        y="237"
        width="80"
        height="11"
      />
      <rect
        x="10"
        y="27"
        width="80"
        height="220"
      />
      <rect
        x="25"
        y="35"
        width="50"
        height="8"
        rx="4"
        ry="4"
      />
      <rect
        x="10"
        y="27"
        width="80"
        height="23.8"
      />
    </g>
    <SetpointValues
      :part="part"
      :start-y="2"
      :background-color="color"
      hide-unset
      settings-key="setpoint"
    />
  </g>
</template>
