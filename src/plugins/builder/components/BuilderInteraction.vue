<script setup lang="ts">
import { computed, CSSProperties, inject } from 'vue';
import { InteractableKey, PlaceholderKey } from '../symbols';

const props = defineProps({
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
  /**
   * Handled as a property instead of an emitted event
   * to allow for presence checks.
   */
  onInteract: {
    type: Function,
    default: null,
  },
});

const placeholder = inject(PlaceholderKey, false);
const interactionAllowed = inject(
  InteractableKey,
  computed(() => false),
);

const style = computed<CSSProperties>(() => {
  const styleObj: CSSProperties = {};

  if (interactionAllowed.value && props.onInteract != null) {
    styleObj.cursor = 'pointer';
    styleObj.pointerEvents = 'auto';
  }

  return styleObj;
});

function interact(): void {
  if (interactionAllowed.value) {
    props.onInteract?.();
  }
}
</script>

<template>
  <g
    v-if="!placeholder"
    class="interaction"
  >
    <rect
      v-bind="{ x, y, width, height }"
      class="interaction-highlight"
    />
    <foreignObject v-bind="{ x, y, width, height }">
      <div
        class="fit"
        :style="style"
        @click="interact"
      >
        <slot />
      </div>
    </foreignObject>
  </g>
</template>
