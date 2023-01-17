<script lang="ts">
import { GraphConfig } from '@/plugins/history/types';
import { emptyGraphConfig } from '@/plugins/history/utils';
import { nanoid } from 'nanoid';
import { defineComponent, ref } from 'vue';
import { usePart } from '../composables';

export default defineComponent({
  name: 'GraphDisplayPartComponent',
  setup() {
    const { width, height } = usePart.setup();
    const graphId = nanoid();
    const config = ref<GraphConfig>({
      ...emptyGraphConfig(),
      fields: [
        'sparkey/SystemInfo/updatesPerSecond',
        'sparkey/SystemInfo/uptime[second]',
      ],
    });

    return {
      width,
      height,
      graphId,
      config,
    };
  },
});
</script>

<template>
  <svg v-bind="{ width, height }">
    <foreignObject v-bind="{ width, height }">
      <HistoryGraph v-bind="{ graphId, config }" />
    </foreignObject>
  </svg>
</template>
