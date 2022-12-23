<script lang="ts">
import { computed, defineComponent } from 'vue';
import { usePart } from '../composables';
import { liquidBorderColor } from '../utils';

export default defineComponent({
  name: 'PwmDisplayPartComponent',
  setup() {
    const { part, bordered, width, height } = usePart.setup();

    const borderColor = computed<string>(() => liquidBorderColor(part.value));

    return {
      width,
      height,
      bordered,
      borderColor,
    };
  },
});
</script>

<template>
  <PwmValues v-bind="{ width, height, bordered, borderColor }" />
</template>
