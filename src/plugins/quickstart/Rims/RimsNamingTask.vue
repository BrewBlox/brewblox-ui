<script setup lang="ts">
import { computed } from 'vue';
import { UseTaskEmits, UseTaskProps } from '../composables';
import { RimsBlockNames, RimsConfig } from './types';

const props = defineProps<UseTaskProps<RimsConfig>>();

const emit = defineEmits<UseTaskEmits<RimsConfig>>();

const defaultNames: RimsBlockNames = {
  kettleSensor: 'Kettle Sensor',
  kettleSetpoint: 'Kettle Setpoint',
  kettlePid: 'Kettle PID',
  tubeSensor: 'Tube Sensor',
  tubeDriver: 'Tube Setpoint Driver',
  tubeSetpoint: 'Tube Setpoint',
  tubePid: 'Tube PID',
  tubePwm: 'Tube PWM',
  tubeAct: 'Tube Actuator',
  pumpAct: 'Pump Actuator',
};

const localConfig = computed<RimsConfig>({
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
    default-prefix="RIMS"
    default-dashboard-title="RIMS"
    @back="$emit('back')"
    @next="$emit('next')"
  />
</template>
