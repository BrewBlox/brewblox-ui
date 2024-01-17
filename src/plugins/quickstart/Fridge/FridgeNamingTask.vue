<script setup lang="ts">
import { computed } from 'vue';
import { UseTaskEmits, UseTaskProps } from '../composables';
import { FridgeConfig, FridgeConfigNames } from './types';

const props = defineProps<UseTaskProps<FridgeConfig>>();

const emit = defineEmits<UseTaskEmits<FridgeConfig>>();

const defaultNames: FridgeConfigNames = {
  fridgeSensor: 'Sensor',
  fridgeSetpoint: 'Setting',
  tempProfile: 'Temperature Profile',
  coolAct: 'Cool Actuator',
  heatAct: 'Heat Actuator',
  coolPwm: 'Cool PWM',
  heatPwm: 'Heat PWM',
  mutex: 'Mutex',
  coolPid: 'Cool PID',
  heatPid: 'Heat PID',
};

const localConfig = computed<FridgeConfig>({
  get: () => props.config,
  set: (cfg) =>
    emit('update:config', {
      ...cfg,
      widgets: [],
      createdBlocks: [],
      changedBlocks: [],
      renamedBlocks: {},
    }),
});
</script>

<template>
  <QuickstartNamingTask
    v-model:config="localConfig"
    :default-names="defaultNames"
    default-prefix="Fridge"
    default-dashboard-title="Fridge"
    @back="$emit('back')"
    @next="$emit('next')"
  />
</template>
