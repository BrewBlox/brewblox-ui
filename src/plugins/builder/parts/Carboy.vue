<script lang="ts">
import svgpath from 'svgpath';
import { computed, defineComponent, PropType } from 'vue';

import { colorString, squares } from '@/plugins/builder/utils';

import { usePart } from '../composables';
import { DEFAULT_SIZE_X, DEFAULT_SIZE_Y } from '../specs/Carboy';
import { FlowPart } from '../types';

const basePath = `
    M89.2,199
    H10.8
    c-5.4,0-9.8-4.4-9.8-9.9
    V43.9
    c0-4.4,2.9-8.3,7-9.5
    l32.6-8.8
    V2
    h18.6
    v24.6
    L92,34.4
    c4.2,1.2,7,5.1,7,9.5
    v145.2
    C99,194.6,94.6,199,89.2,199
    z`;

export default defineComponent({
  name: 'Carboy',
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
    } = usePart.setup(props.part);

    const color = computed<string>(
      () => colorString(props.part.settings.color),
    );

    const scaleX = computed<number>(
      () => sizeX.value / DEFAULT_SIZE_X,
    );

    const scaleY = computed<number>(
      () => sizeY.value / DEFAULT_SIZE_Y,
    );

    const valueY = computed<number>(
      () => Math.round(sizeY.value / 4),
    );

    const path = computed<string>(
      () => scaleX.value === 1 && scaleY.value === 1
        ? basePath
        : svgpath(basePath)
          .transform(`scale(${scaleX.value} ${scaleY.value})`)
          .round(1)
          .toString(),
    );

    return {
      squares,
      color,
      sizeX,
      sizeY,
      scaleX,
      scaleY,
      valueY,
      path,
    };
  },
});
</script>

<template>
  <g>
    <rect
      :y="squares(1)"
      :width="squares(sizeX)"
      :height="squares(sizeY-1)-2"
      :fill="color"
      rx="8"
      ry="8"
    />
    <g class="outline">
      <path :d="path" />
    </g>
    <SetpointValues
      :part="part"
      :start-y="valueY"
      :start-x="sizeX / 2 - 1"
      :background-color="color"
      settings-key="setpoint"
      hide-unset
    />
  </g>
</template>
