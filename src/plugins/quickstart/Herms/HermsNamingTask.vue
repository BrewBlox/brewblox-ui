<script setup lang="ts">
import { HermsBlockNames, HermsConfig } from './types';
import { computed, defineComponent, PropType } from 'vue';

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

export default defineComponent({
  name: 'HermsNamingTask',
  props: {
    config: {
      type: Object as PropType<HermsConfig>,
      required: true,
    },
  },
  emits: ['update:config', 'back', 'next'],
  setup(props, { emit }) {
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

    return {
      defaultNames,
      localConfig,
    };
  },
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
