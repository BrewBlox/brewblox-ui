<script setup lang="ts">
import { UseTaskEmits, UseTaskProps } from '../composables';
import { HermsBlockNames, HermsConfig } from './types';
import { computed } from 'vue';

const props = defineProps<UseTaskProps<HermsConfig>>();

const emit = defineEmits<UseTaskEmits<HermsConfig>>();

const defaultNames: HermsBlockNames = {
  hltSensor: 'HLT Sensor',
  hltDriver: 'HLT Setpoint Driver',
  hltSetpoint: 'HLT Setpoint',
  hltPid: 'HLT PID',
  hltPwm: 'HLT PWM',
  hltAct: 'HLT Actuator',
  mtSensor: 'MT Sensor',
  mtSetpoint: 'MT Setpoint',
  mtPid: 'MT PID',
  bkSensor: 'BK Sensor',
  bkSetpoint: 'BK Setpoint',
  bkPid: 'BK PID',
  bkPwm: 'BK PWM',
  bkAct: 'BK Actuator',
  mutex: 'Mutex',
  balancer: 'Balancer',
};

const localConfig = computed<HermsConfig>({
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
    default-prefix="HERMS"
    default-dashboard-title="HERMS"
    @back="$emit('back')"
    @next="$emit('next')"
  />
</template>
