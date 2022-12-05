<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'ActionSubmenu',
  props: {
    label: {
      type: null as unknown as PropType<string | null>,
      default: null,
    },
  },
});
</script>

<template>
  <div class="col-auto column no-wrap">
    <div
      v-if="!!label"
      class="col-auto q-py-sm q-px-md text-italic text-grey-5"
      style="font-size: 120%"
    >
      {{ label }}
    </div>
    <slot />
  </div>
</template>
