<script setup lang="ts">
import { computed } from 'vue';
import { UseTaskEmits, UseTaskProps } from '../composables';
import { GlycolBlockNames, GlycolConfig } from './types';

const props = defineProps<UseTaskProps<GlycolConfig>>();

const emit = defineEmits<UseTaskEmits<GlycolConfig>>();

const defaultNames: GlycolBlockNames = {
  beerSensor: 'Beer Sensor',
  beerSetpoint: 'Beer Setpoint',
  beerProfile: 'Beer Profile',
  coolPid: 'Cool PID',
  coolPwm: 'Cool PWM',
  coolAct: 'Cool Actuator',
  heatPid: 'Heat PID',
  heatPwm: 'Heat PWM',
  heatAct: 'Heat Actuator',
  glycolSensor: 'Glycol Sensor',
  glycolSetpoint: 'Glycol Setpoint',
  glycolPid: 'Glycol PID',
  glycolPwm: 'Glycol PWM',
  glycolAct: 'Glycol Actuator',
  mutex: 'Mutex',
};

const localConfig = computed<GlycolConfig>({
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
