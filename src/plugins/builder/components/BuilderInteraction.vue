<script lang="ts">
import { defineComponent } from 'vue';
import { usePart } from '../composables';

export default defineComponent({
  name: 'BuilderInteraction',
  props: {
    width: {
      type: Number,
      default: 50,
    },
    height: {
      type: Number,
      default: 50,
    },
    x: {
      type: Number,
      default: 0,
    },
    y: {
      type: Number,
      default: 0,
    },
    onInteract: {
      type: Function,
      default: null,
    },
  },
  emits: ['interact'],
  setup() {
    const { interact } = usePart.setup();

    return {
      interact,
    };
  },
});
</script>

<template>
  <foreignObject v-bind="{ x, y, width, height }">
    <div
      :class="{
        interaction: true,
        pointer: onInteract != null,
      }"
      @click="interact(() => onInteract && onInteract())"
    >
      <slot />
    </div>
  </foreignObject>
</template>
