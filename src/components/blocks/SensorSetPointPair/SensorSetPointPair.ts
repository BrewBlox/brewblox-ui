import Vue from 'vue';
import Component from 'vue-class-component';

import { getById } from '../../../store/blocks/SensorSetPointPair/getters';
import { getById as getSetPointSimpleById }
  from '../../../store/blocks/SetPointSimple/getters';
import { getById as getOneWireTempSensorById }
  from '../../../store/blocks/OneWireTempSensor/getters';
import { persist } from '../../../store/blocks/SensorSetPointPair/actions';

@Component({
  props: {
    id: {
      default: '',
      type: String,
    },
  },
})
export default class SensorSetPointPair extends Vue {
  sensorInput = '';
  setpointInput = '';

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

  get changed() {
    return this.sensor.id !== this.sensorInput || this.setpoint.id !== this.setpointInput;
  }

  mounted() {
    // set default values
    this.sensorInput = this.sensor.id;
    this.setpointInput = this.setpoint.id;
  }

  update() {
    const links: { sensor?: string, setpoint?: string } = {};

    if (this.sensorInput !== this.sensor.id) {
      links.sensor = this.sensorInput;
    }

    if (this.setpointInput !== this.setpoint.id) {
      links.setpoint = this.setpointInput;
    }

    persist({
      links,
      id: this.$props.id,
    });
  }
}
