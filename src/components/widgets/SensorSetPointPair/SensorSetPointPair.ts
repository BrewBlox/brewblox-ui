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

  get block(): SensorSetPointPairBlock {
    return this.block as SensorSetPointPairBlock;
  }

  get sensor(): OneWireTempSensorBlock {
    const { data, serviceId } = this.block;

    return getSensorById(this.$store, `${serviceId}/${data.sensor}`);
  }

  get setPoint(): SetPointSimpleBlock {
    const { data, serviceId } = this.block;

    return getSetPointById(this.$store, `${serviceId}/${data.setpoint}`);
  }

  get setpointChanged() {
    return this.setPoint.data.setting !== this.inputs.setpoint;
  }

  save() {
    // persist(this.$store, {
    //   id: this.block.id,
    //   serviceId: this.block.serviceId,
    // });
  }
}
