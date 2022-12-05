<script lang="ts">
import { CENTER } from '@/plugins/builder/const';
import { computed, defineComponent } from 'vue';
import { usePart } from '../composables';
import { coord2grid, liquidOnCoord } from '../utils';

export default defineComponent({
  name: 'SetpointDisplayPartComponent',
  props: { ...usePart.props },
  emits: [...usePart.emits],
  setup(props) {
    const { scale, bordered } = usePart.setup(props.part);

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
  <svg
    v-bind="{ width, height }"
    viewBox="0 0 100 50"
  >
    <SetpointValues
      :part="part"
      settings-key="setpoint"
    />
    <g class="outline">
      <rect
        v-show="bordered"
        :width="100 - 2"
        :height="50 - 2"
        :stroke="color"
        stroke-width="2px"
        x="1"
        y="1"
        rx="6"
        ry="6"
      />
    </g>
  </svg>
</template>
