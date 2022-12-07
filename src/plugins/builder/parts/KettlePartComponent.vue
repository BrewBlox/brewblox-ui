<script lang="ts">
import { colorString } from '@/plugins/builder/utils';
import { computed, defineComponent } from 'vue';
import { DEFAULT_FILL_PCT } from '../blueprints/Kettle';
import { usePart } from '../composables';

export default defineComponent({
  name: 'KettlePartComponent',
  setup() {
    const { settings, width, height } = usePart.setup();

    const filledHeight = computed<number>(() => {
      const pct = settings.value['fillPct'] ?? DEFAULT_FILL_PCT;
      return pct * (height.value / 100);
    });

    const color = computed<string>(() => colorString(settings.value['color']));

    return {
      width,
      height,
      filledHeight,
      color,
    };
  },
});
</script>

<template>
  <svg v-bind="{ width, height }">
    <rect
      :fill="color"
      :x="2"
      :y="height - filledHeight + 2"
      :width="width - 4"
      :height="filledHeight - 4"
      rx="2"
      ry="2"
    />
    <g class="outline">
      <rect
        :width="width - 4"
        :height="height - 4"
        x="2"
        y="2"
        rx="8"
        ry="8"
        stroke-width="4px"
      />
    </g>
    <BuilderLabelValues
      :width="width"
      :height="50"
    />
  </svg>
</template>
