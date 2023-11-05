<script setup lang="ts">
import BlockEnableToggle from '../../components/form/BlockEnableToggle.vue';
import ActuatorAnalogMockBasic from './ActuatorAnalogMockBasic.vue';
import ActuatorAnalogMockFull from './ActuatorAnalogMockFull.vue';
import { useContext } from '@/composables';

const modes = {
  Basic: ActuatorAnalogMockBasic,
  Full: ActuatorAnalogMockFull,
} as const;

const { context } = useContext.setup();
</script>

<template>
  <Card>
    <template #toolbar>
      <BlockWidgetToolbar has-mode-toggle />
    </template>
    <component :is="modes[context.mode]">
      <template #warnings>
        <BlockEnableToggle />
      </template>
    </component>
  </Card>
</template>
