<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { FermentBlockNames, FermentConfig } from './types';

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

export default defineComponent({
  name: 'FermentNamingTask',
  props: {
    config: {
      type: Object as PropType<FermentConfig>,
      required: true,
    },
  },
  emits: ['update:config', 'back', 'next'],
  setup(props, { emit }) {
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
