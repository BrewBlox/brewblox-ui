import Vue from 'vue';
import Component from 'vue-class-component';

import { DeviceService } from '@/store/services/state';
import { SetPointSimple } from '@/store/blocks/SetPointSimple/SetPointSimple';
import { OneWireTempSensor } from '@/store/blocks/OneWireTempSensor/OneWireTempSensor';

import { deviceServices } from '@/store/services/getters';
import { getAll as getAllSetPointSimple } from '@/store/blocks/SetPointSimple/getters';
import { getAll as getAllOneWireTempSensor } from '@/store/blocks/OneWireTempSensor/getters';
import { createSensorSetPointPair } from '@/store/blocks/SensorSetPointPair/actions';

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
  blockId: string = '';
  service: DeviceService | null = null;
  setpointInput: SetPointSimple | null = null;
  sensorInput: OneWireTempSensor | null = null;

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

    if (this.currentStep === 'block-id' && this.id) {
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

      const block = await createSensorSetPointPair(this.$store, {
        id: this.blockId,
        serviceId: this.service.id,
        profiles: [0],
        sensor: this.sensorInput.id,
        setpoint: this.setpointInput.id,
      });

      this.creating = false;

      this.$props.onCreate(block);
    } catch (e) {
      throw new Error(e);
    }
  }
}

export default SensorSetPointPair;
