<script lang="ts">
import Vue from 'vue';

import { blockById } from '@/store/blocks/getters';

const blockTypes = {
  // Block type components
  OneWireTempSensor: () => import('./OneWireTempSensor/OneWireTempSensor.vue'),
  SetPointSimple: () => import('./SetPointSimple/SetPointSimple.vue'),
  SensorSetPointPair: () => import('./SensorSetPointPair/SensorSetPointPair.vue'),
  OneWireBus: () => import('./OneWireBus/OneWireBus.vue'),
  Profiles: () => import('./Profiles/Profiles.vue'),
  SysInfo: () => import('./SysInfo/SysInfo.vue'),
  Ticks: () => import('./Ticks/Ticks.vue'),

  // fallback component when type is not resolved
  Unknown: () => import('./Unknown.vue'),
};

export default Vue.extend({
  name: 'block',
  components: { ...blockTypes },
  props: {
    blockId: {
      default: '',
      type: String,
    },
  },
  computed: {
    type(): string {
      const { type } = blockById(this.$store, this.$props.blockId);

      if (Object.keys(blockTypes).indexOf(type) === -1) {
        return 'Unknown';
      }

      return type;
    },
  },
});
</script>

<template>
  <component
    :is="type"
    :id="blockId"
  />
</template>
