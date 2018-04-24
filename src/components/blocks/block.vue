<template>
  <component
    :is="type"
    :id="blockId"
  />
</template>

<script lang="ts">
import Vue from 'vue';

import { blockById } from '@/store/blocks/getters';

const blockTypes = {
  // Block type components
  OneWireTempSensor: () => import('./OneWireTempSensor/default.vue'),
  SetPointSimple: () => import('./SetPointSimple/default.vue'),
  SensorSetPointPair: () => import('./SensorSetPointPair/default.vue'),

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
      const type = blockById(this.$store, this.$props.blockId).type;

      if (Object.keys(blockTypes).indexOf(type) === -1) {
        return 'Unknown';
      }

      return type;
    },
  },
});
</script>
