import Component from 'vue-class-component';

import BlockComponent from '../BlockComponent';

import Link from '@/core/units/Link';

import { getById } from '@/store/blocks/SensorSetPointPair/getters';
import {
  getById as getSetPointSimpleById,
  getAll as getAllSetPointSimple,
} from '@/store/blocks/SetPointSimple/getters';
import {
  getById as getOneWireTempSensorById,
  getAll as getAllOneWireTempSensor,
} from '@/store/blocks/OneWireTempSensor/getters';
import { saveBlock } from '@/store/blocks/actions';
import { OneWireTempSensorBlock } from '@/store/blocks/OneWireTempSensor/OneWireTempSensor';

/* eslint-disable indent */
@Component({
  props: {
    id: {
      default: '',
      type: String,
    },
  },
})
/* eslint-enable */
export default class SensorSetPointPair extends BlockComponent {
  sensorInput = '';
  setpointInput = '';

  get block() {
    return getById(this.$store, this.$props.id);
  }

  get sensor(): OneWireTempSensorBlock {
    return getOneWireTempSensorById(
      this.$store,
      `${this.block.serviceId}/${this.block.data.sensor}`,
    );
  }

  get setpoint() {
    return getSetPointSimpleById(
      this.$store,
      `${this.block.serviceId}/${this.block.data.setpoint}`,
    );
  }

  get allSetPoints() {
    return getAllSetPointSimple(this.$store, this.block.serviceId)
      .map(setpoint => ({
        label: `${setpoint.serviceId}/${setpoint.id}`,
        value: setpoint.id,
      }));
  }

  get allSensors() {
    return getAllOneWireTempSensor(this.$store, this.block.serviceId)
      .map(sensor => ({
        label: `${sensor.serviceId}/${sensor.id}`,
        value: sensor.id,
      }));
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
    this.block.data.sensor = new Link(this.sensorInput);
    this.block.data.setpoint = new Link(this.setpointInput);

    saveBlock(this.$store, this.block);
  }
}
