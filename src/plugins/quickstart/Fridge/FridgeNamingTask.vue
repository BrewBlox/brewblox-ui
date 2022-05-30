<script lang="ts">
import { PropType, computed, defineComponent } from 'vue';

import { FridgeConfig, FridgeConfigNames } from './types';

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

export default defineComponent({
  name: 'FridgeNamingTask',
  props: {
    config: {
      type: Object as PropType<FridgeConfig>,
      required: true,
    },
  },
  emits: ['update:config', 'back', 'next'],
  setup(props, { emit }) {
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
    default-prefix="Fridge"
    default-dashboard-title="Fridge"
    @back="$emit('back')"
    @next="$emit('next')"
  />
</template>
