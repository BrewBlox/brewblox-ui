<script lang="ts">
import { computed, defineComponent } from 'vue';
import { usePart } from '../composables';
import { liquidBorderColor } from '../utils';

export default defineComponent({
  name: 'SetpointDisplayPartComponent',
  setup() {
    const { part, width, height, bordered } = usePart.setup();

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
  <SetpointValues
    v-bind="{ width, height, bordered, borderColor }"
    always
  />
</template>
