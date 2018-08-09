import Component, { mixins } from 'vue-class-component';

import { SensorSetPointPairBlock } from '@/store/blocks/SensorSetPointPair/SensorSetPointPair';
import { OneWireTempSensorBlock } from '@/store/blocks/OneWireTempSensor/OneWireTempSensor';
import { SetPointSimpleBlock } from '@/store/blocks/SetPointSimple/SetPointSimple';

import { getById as getSensorById } from '@/store/blocks/OneWireTempSensor/getters';
import { getById as getSetPointById } from '@/store/blocks/SetPointSimple/getters';

import BlockWidget from '../BlockWidget';

@Component
export default class SensorSetPointPairWidget extends mixins(BlockWidget) {
  inputMapping = {
    setpoint: { path: 'setPoint.settings.value', default: 0 },
  };

  get blockData(): SensorSetPointPairBlock {
    return this.block as SensorSetPointPairBlock;
  }

  get sensor(): OneWireTempSensorBlock {
    const { sensor, serviceId } = this.blockData;

    return getSensorById(this.$store, `${serviceId}/${sensor}`);
  }

  get setPoint(): SetPointSimpleBlock {
    const { setpoint, serviceId } = this.blockData;

    return getSetPointById(this.$store, `${serviceId}/${setpoint}`);
  }

  get setpointChanged() {
    return this.setPoint.setting !== this.inputs.setpoint;
  }

  save() {
    // persist(this.$store, {
    //   id: this.block.id,
    //   serviceId: this.block.serviceId,
    // });
  }
}
