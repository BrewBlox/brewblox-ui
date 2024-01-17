<script setup lang="ts">
import { computed } from 'vue';
import { UseTaskEmits, UseTaskProps } from '../composables';
import { BrewKettleBlockNames, BrewKettleConfig } from './types';

const defaultNames: BrewKettleBlockNames = {
  kettleSensor: 'Sensor',
  kettleSetpoint: 'Setpoint',
  kettlePid: 'PID',
  kettlePwm: 'PWM',
  kettleAct: 'Actuator',
};

const props = defineProps<UseTaskProps<BrewKettleConfig>>();

const emit = defineEmits<UseTaskEmits<BrewKettleConfig>>();

const localConfig = computed<BrewKettleConfig>({
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
    default-prefix="Kettle"
    default-dashboard-title="Brew Kettle"
    @back="$emit('back')"
    @next="$emit('next')"
  />
</template>
