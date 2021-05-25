<script lang="ts">
import { defineComponent } from 'vue';

import { useContext } from '@/composables';

import ActuatorAnalogMockBasic from './ActuatorAnalogMockBasic.vue';
import ActuatorAnalogMockFull from './ActuatorAnalogMockFull.vue';

export default defineComponent({
  name: 'ActuatorAnalogMockWidget',
  components: {
    Basic: ActuatorAnalogMockBasic,
    Full: ActuatorAnalogMockFull,
  },
  setup() {
    const { context } = useContext.setup();
    return { context };
  },
});
</script>

<template>
  <Card>
    <template #toolbar>
      <BlockWidgetToolbar has-mode-toggle />
    </template>
    <component :is="context.mode" />
  </Card>
</template>
