<script lang="ts">
import { computed, defineComponent } from 'vue';
import { usePart } from '../composables';

export default defineComponent({
  name: 'HeatingElementPartComponent',
  props: { ...usePart.props },
  emits: [...usePart.emits],
  setup(props) {
    const path = computed<string>(() => {
      const straight = props.width - 100;
      return `M50,24.7h24c7.1,0,6.6-6.7,14-6.7 h${straight} c0,0,7,0.1,7,7 c0,7-7,7-7,7 H90`;
    });

    return {
      path,
    };
  },
});
</script>

<template>
  <!-- No viewBox. width is auto-adjusted -->
  <svg v-bind="{ width, height }">
    <PwmValues
      :part="part"
      settings-key="pwm"
    />
    <g class="outline">
      <path :d="path" />
    </g>
  </svg>
</template>
