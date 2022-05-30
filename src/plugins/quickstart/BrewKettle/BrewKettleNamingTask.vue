<script lang="ts">
import { PropType, computed, defineComponent } from 'vue';

import { BrewKettleBlockNames, BrewKettleConfig } from './types';

const defaultNames: BrewKettleBlockNames = {
  kettleSensor: 'Sensor',
  kettleSetpoint: 'Setpoint',
  kettlePid: 'PID',
  kettlePwm: 'PWM',
  kettleAct: 'Actuator',
};

export default defineComponent({
  name: 'BrewKettleNamingTask',
  props: {
    config: {
      type: Object as PropType<BrewKettleConfig>,
      required: true,
    },
  },
  emits: ['update:config', 'back', 'next'],
  setup(props, { emit }) {
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
    default-prefix="Kettle"
    default-dashboard-title="Brew Kettle"
    @back="$emit('back')"
    @next="$emit('next')"
  />
</template>
