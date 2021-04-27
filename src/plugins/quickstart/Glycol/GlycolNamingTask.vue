<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { GlycolBlockNames, GlycolConfig } from './types';

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

export default defineComponent({
  name: 'GlycolNamingTask',
  props: {
    config: {
      type: Object as PropType<GlycolConfig>,
      required: true,
    },
  },
  emits: [
    'update:config',
    'back',
    'next',
  ],
  setup(props, { emit }) {
    const localConfig = computed<GlycolConfig>({
      get: () => props.config,
      set: cfg => emit('update:config', {
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
    default-prefix="Ferment"
    default-dashboard-title="Fermentation"
    @back="$emit('back')"
    @next="$emit('next')"
  />
</template>
