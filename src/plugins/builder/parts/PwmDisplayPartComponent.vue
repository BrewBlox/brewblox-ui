<script lang="ts">
import { CENTER } from '@/plugins/builder/const';
import { computed, defineComponent } from 'vue';
import { PWM_KEY } from '../blueprints/PwmDisplay';
import { usePart } from '../composables';
import { liquidOnCoord } from '../utils';

export default defineComponent({
  name: 'PwmDisplayPartComponent',
  props: { ...usePart.props },
  emits: [...usePart.emits],
  setup(props) {
    const color = computed<string>(
      () => liquidOnCoord(props.part, CENTER)[0] ?? '',
    );

    return {
      PWM_KEY,
      color,
    };
  },
});
</script>

<template>
  <PwmValues
    v-bind="{ part, width, height }"
    :settings-key="PWM_KEY"
    :color="color"
  />
</template>
