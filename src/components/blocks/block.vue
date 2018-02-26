<template>
  <div>Test</div>
</template>

<script lang="ts">
import Vue from 'vue';

import { blockById } from '../../store/blocks/getters';

const blockTypes = {
  SetPointSimple: () => import('./SetPointSimple.vue'),
  OneWireTempSensor: () => import('./OneWireTempSensor.vue'),
};

export default Vue.extend({
  name: 'block',
  props: ['block-data'],
  computed: {
    type: () => { debugger; },
  },
  components: { ...blockTypes },
  // render(createElement) {
  //   const { type } = this.$props.blockData;
  //   const options = {
  //     props: this.$props.blockData,
  //   };
  //
  //   switch (type) {
  //     case 'OneWireTempSensor':
  //       return createElement(OneWireTempSensor, options);
  //     case 'SetPointSimple':
  //       return createElement(SetPointSimple, options);
  //     default:
  //       throw new Error(`'${type}' is not a valid block type`);
  //   }
  // },
});
</script>
