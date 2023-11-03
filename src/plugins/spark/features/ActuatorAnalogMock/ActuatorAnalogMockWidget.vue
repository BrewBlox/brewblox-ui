<script setup lang="ts">
import BlockEnableToggle from '../../components/form/BlockEnableToggle.vue';
import ActuatorAnalogMockBasic from './ActuatorAnalogMockBasic.vue';
import ActuatorAnalogMockFull from './ActuatorAnalogMockFull.vue';
import { useContext } from '@/composables';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ActuatorAnalogMockWidget',
  components: {
    Basic: ActuatorAnalogMockBasic,
    Full: ActuatorAnalogMockFull,
    BlockEnableToggle,
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
    <component :is="context.mode">
      <template #warnings>
        <BlockEnableToggle />
      </template>
    </component>
  </Card>
</template>
