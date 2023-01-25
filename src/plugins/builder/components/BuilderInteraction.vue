<script lang="ts">
import { computed, defineComponent, inject } from 'vue';
import { InteractableKey, PlaceholderKey } from '../symbols';

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
    /**
     * Handled as a property instead of an emitted event
     * to allow for presence checks.
     */
    onInteract: {
      type: Function,
      default: null,
    },
  },
  setup(props) {
    const placeholder = inject(PlaceholderKey, false);
    const interactionAllowed = inject(
      InteractableKey,
      computed(() => false),
    );

    const style = computed(() =>
      interactionAllowed.value && props.onInteract != null
        ? { cursor: 'pointer' }
        : {},
    );

    function interact(): void {
      if (interactionAllowed.value) {
        props.onInteract?.();
      }
    }

    return {
      style,
      placeholder,
      interact,
    };
  },
});
</script>

<template>
  <foreignObject
    v-if="!placeholder"
    v-bind="{ x, y, width, height }"
  >
    <div
      class="interaction"
      :style="style"
      @click="interact"
    >
      <slot />
    </div>
  </foreignObject>
</template>
