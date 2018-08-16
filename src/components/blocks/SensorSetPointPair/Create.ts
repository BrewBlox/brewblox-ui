import Vue from 'vue';
import Component from 'vue-class-component';
import shortid from 'shortid';

import Link from '@/core/units/Link';

import { DeviceService } from '@/store/services/state';
import { SetPointSimpleBlock } from '@/store/blocks/SetPointSimple/SetPointSimple';
import { OneWireTempSensorBlock } from '@/store/blocks/OneWireTempSensor/OneWireTempSensor';

import { deviceServices } from '@/store/services/getters';
import { getAll as getAllSetPointSimple } from '@/store/blocks/SetPointSimple/getters';
import { getAll as getAllOneWireTempSensor } from '@/store/blocks/OneWireTempSensor/getters';
import { createBlock } from '@/store/blocks/actions';

/* eslint-disable indent */
@Component({
  props: {
    onCancel: {
      type: Function,
      default: () => { },
    },
    onCreate: {
      type: Function,
      default: () => { },
    },
  },
})
/* eslint-enable */
class SensorSetPointPair extends Vue {
  currentStep: string = 'service';
  creating: boolean = false;
  service: DeviceService | null = null;
  setpointInput: SetPointSimpleBlock | null = null;
  sensorInput: OneWireTempSensorBlock | null = null;

  get services() {
    return deviceServices(this.$store).map(service => ({
      label: service.id,
      value: service,
    }));
  }

  get canContinue() {
    if (this.currentStep === 'service' && this.service) {
      return true;
    }

    if (this.currentStep === 'sensor-setpoint' && this.setpointInput && this.sensorInput) {
      return true;
    }

    return false;
  }

  get allSensors() {
    if (!this.service) {
      return [];
    }

    return getAllOneWireTempSensor(this.$store, this.service.id)
      .map(sensor => ({
        label: `${sensor.serviceId}/${sensor.id}`,
        value: sensor,
      }));
  }

  get allSetPoints() {
    if (!this.service) {
      return [];
    }

    return getAllSetPointSimple(this.$store, this.service.id)
      .map(setpoint => ({
        label: `${setpoint.serviceId}/${setpoint.id}`,
        value: setpoint,
      }));
  }

  clearLinks() {
    this.setpointInput = null;
    this.sensorInput = null;
  }

  async createBlock() {
    try {
      this.creating = true;

      if (!this.service || !this.sensorInput || !this.setpointInput) {
        throw new Error('Invalid values for inputs');
      }

      const block = await createBlock(this.$store, {
        id: `SensorSetPointPair-${shortid.generate()}`,
        serviceId: this.service.id,
        profiles: [0],
        type: 'SensorSetPointPair',
        data: {
          sensor: new Link(this.sensorInput.id),
          setpoint: new Link(this.setpointInput.id),
        },
      });

      this.creating = false;

      this.$props.onCreate(block);
    } catch (e) {
      throw new Error(e);
    }
  }
}

export default SensorSetPointPair;
