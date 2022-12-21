<script lang="ts">
import { CENTER } from '@/plugins/builder/const';
import { computed, defineComponent } from 'vue';
import { usePart } from '../composables';
import { liquidOnCoord } from '../utils';

export default defineComponent({
  name: 'PwmDisplayPartComponent',
  setup() {
    const { part, bordered, width, height } = usePart.setup();

    const color = computed<string>(
      () => liquidOnCoord(part.value, CENTER)[0] ?? '',
    );

    return {
      width,
      height,
      bordered,
      color,
    };
  },
});
</script>

<template>
  <PwmValues v-bind="{ width, height, bordered, color }" />
</template>
