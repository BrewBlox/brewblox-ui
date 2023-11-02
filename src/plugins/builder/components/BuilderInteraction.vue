<script setup lang="ts">
import { InteractableKey, PlaceholderKey } from '../symbols';
import { computed, CSSProperties, inject } from 'vue';

interface Props {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  /**
   * Handled as a property instead of an emitted event
   * to allow for presence checks.
   */
  onInteract?: (evt: MouseEvent) => unknown;
}

const props = withDefaults(defineProps<Props>(), {
  width: 50,
  height: 50,
  x: 0,
  y: 0,
  onInteract: undefined,
});

const placeholder = inject(PlaceholderKey, false);
const interactionAllowed = inject(
  InteractableKey,
  computed(() => false),
);

const style = computed<CSSProperties>(() => {
  const styleObj: CSSProperties = {};

  if (interactionAllowed.value) {
    styleObj.pointerEvents = 'auto';

    if (props.onInteract != null) {
      styleObj.cursor = 'pointer';
    }
  }

  return styleObj;
});

function interact(evt: MouseEvent): void {
  if (interactionAllowed.value) {
    props.onInteract?.(evt);
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
