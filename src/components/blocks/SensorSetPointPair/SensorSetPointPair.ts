import Component from 'vue-class-component';

import BlockComponent from '../BlockComponent';

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
export default class SensorSetPointPair extends BlockComponent {
  sensorInput = '';
  setpointInput = '';

  get blockData() {
    return getById(this.$store, this.$props.id);
  }

  get links() {
    return this.blockData.links;
  }

  get sensor() {
    return getOneWireTempSensorById(this.$store, this.links.sensor);
  }

  get setpoint() {
    return getSetPointSimpleById(this.$store, this.links.setpoint);
  }

  get allSetPoints() {
    return getAllSetPointSimple(this.$store)
      .map(setpoint => ({ label: setpoint.id, value: setpoint.id }));
  }

  get allSensors() {
    return getAllOneWireTempSensor(this.$store)
      .map(sensor => ({ label: sensor.id, value: sensor.id }));
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

  save() {
    persist(this.$store, {
      links: {
        sensor: this.sensorInput,
        setpoint: this.setpointInput,
      },
      id: this.$props.id,
    });
  }
}
