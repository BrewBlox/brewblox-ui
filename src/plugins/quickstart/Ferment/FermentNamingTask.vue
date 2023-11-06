<script setup lang="ts">
import { UseTaskEmits, UseTaskProps } from '../composables';
import { FermentBlockNames, FermentConfig } from './types';
import { computed } from 'vue';

const props = defineProps<UseTaskProps<FermentConfig>>();

const emit = defineEmits<UseTaskEmits<FermentConfig>>();

const defaultNames: FermentBlockNames = {
  fridgeSensor: 'Fridge Sensor',
  beerSensor: 'Beer Sensor',
  fridgeSetpoint: 'Fridge Setting',
  beerSetpoint: 'Beer Setting',
  tempProfile: 'Temperature Profile',
  coolAct: 'Cool Actuator',
  heatAct: 'Heat Actuator',
  coolPwm: 'Cool PWM',
  heatPwm: 'Heat PWM',
  mutex: 'Mutex',
  coolPid: 'Cool PID',
  heatPid: 'Heat PID',
};

const localConfig = computed<FermentConfig>({
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
    default-prefix="Ferment"
    default-dashboard-title="Fermentation"
    @back="$emit('back')"
    @next="$emit('next')"
  />
</template>
