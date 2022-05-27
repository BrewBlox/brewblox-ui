<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { RimsBlockNames, RimsConfig } from './types';

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

export default defineComponent({
  name: 'RimsNamingTask',
  props: {
    config: {
      type: Object as PropType<RimsConfig>,
      required: true,
    },
  },
  emits: ['update:config', 'back', 'next'],
  setup(props, { emit }) {
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
    default-prefix="RIMS"
    default-dashboard-title="RIMS"
    @back="$emit('back')"
    @next="$emit('next')"
  />
</template>
