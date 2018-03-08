import Vue from 'vue';
import Component from 'vue-class-component';

import { getById } from '../../../store/blocks/SensorSetPointPair/getters';
import { getById as getSetPointSimpleById }
  from '../../../store/blocks/SetPointSimple/getters';
import { getById as getOneWireTempSensorById }
  from '../../../store/blocks/OneWireTempSensor/getters';

@Component({
  props: {
    id: {
      default: '',
      type: String,
    },
  },
})
export default class SensorSetPointPair extends Vue {
  get blockData() {
    return getById(this.$props.id);
  }

  get links() {
    return this.blockData.links;
  }

  get sensor() {
    return getOneWireTempSensorById(this.links.sensor);
  }

  get setpoint() {
    return getSetPointSimpleById(this.links.setpoint);
  }
}
