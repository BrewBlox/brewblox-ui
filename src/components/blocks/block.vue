<template>
  <component
    :is="type"
    :id="blockId"
  />
</template>

<script lang="ts">
import Vue from 'vue';

import { blockById } from '../../store/blocks/getters';

const blockTypes = {
  OneWireTempSensor: () => import('./OneWireTempSensor'),
  SetPointSimple: () => import('./SetPointSimple'),
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
      const type = blockById(this.$props.blockId).type;

      if (Object.keys(blockTypes).indexOf(type) === -1) {
        throw new Error(`'${type}' is not a valid block type`);
      }

      return type;
    },
  },
});
</script>
