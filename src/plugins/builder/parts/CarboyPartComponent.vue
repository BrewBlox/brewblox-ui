<script lang="ts">
import { colorString } from '@/plugins/builder/utils';
import { computed, defineComponent } from 'vue';
import { usePart } from '../composables';
import { COLOR_KEY } from '../const';

const path = `
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
  name: 'CarboyPartComponent',
  setup() {
    const { settings, width, height } = usePart.setup();

    const color = computed<string>(() =>
      colorString(settings.value[COLOR_KEY]),
    );

    return {
      width,
      height,
      color,
      path,
    };
  },
});
</script>

<template>
  <svg
    v-bind="{ width, height }"
    viewBox="0 0 100 200"
  >
    <rect
      :fill="color"
      y="50"
      width="100"
      height="148"
      rx="8"
      ry="8"
    />
    <g class="outline">
      <path :d="path" />
    </g>
    <SetpointValues
      :y="50"
      :background-color="color"
      hide-unset
    />
  </svg>
</template>
