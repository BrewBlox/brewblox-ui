import Vue from 'vue';

import SetPointSimple from './SetPointSimple.vue';
import OneWireTempSensor from './OneWireTempSensor.vue';

export default Vue.extend({
  name: 'block',
  props: ['block-data'],
  render(createElement) {
    const { type } = this.$props.blockData;
    const options = {
      props: this.$props.blockData,
    };

    switch (type) {
      case 'OneWireTempSensor':
        return createElement(OneWireTempSensor, options);
      case 'SetPointSimple':
        return createElement(SetPointSimple, options);
      default:
        throw new Error(`'${type}' is not a valid block type`);
    }
  },
});
