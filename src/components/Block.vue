<script lang="ts">
import Vue from 'vue';

import { blockById } from '@/store/blocks/getters';

const blockTypes = {
  // Block display components
  OneWireTempSensor: () => import('@/features/OneWireTempSensor/OneWireTempSensor.vue'),
  SetPointSimple: () => import('@/features/SetPointSimple/SetPointSimple.vue'),
  SensorSetPointPair: () => import('@/features/SensorSetPointPair/SensorSetPointPair.vue'),
  OneWireBus: () => import('@/features/OneWireBus/OneWireBus.vue'),
  Profiles: () => import('@/features/Profiles/Profiles.vue'),
  SysInfo: () => import('@/features/SysInfo/SysInfo.vue'),
  Ticks: () => import('@/features/Ticks/Ticks.vue'),

  // fallback component when type is not resolved
  UnknownBlock: () => import('@/components/Defaults/UnknownBlock.vue'),
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
        return 'UnknownBlock';
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
