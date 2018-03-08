import Vue from 'vue';
import Component from 'vue-class-component';

import { getById } from '../../../store/blocks/SensorSetPointPair/getters';
import {
  getById as getSetPointSimpleById,
  getAll as getAllSetPointSimple,
} from '../../../store/blocks/SetPointSimple/getters';
import {
  getById as getOneWireTempSensorById,
  getAll as getAllOneWireTempSensor,
} from '../../../store/blocks/OneWireTempSensor/getters';
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

  get allSetPoints() {
    return getAllSetPointSimple().map(setpoint => ({ label: setpoint.id, value: setpoint.id }));
  }

  get allSensors() {
    return getAllOneWireTempSensor().map(sensor => ({ label: sensor.id, value: sensor.id }));
  }

  get loading() {
    return !!this.blockData.isLoading;
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
