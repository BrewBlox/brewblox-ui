<script lang="ts">
import Component, { mixins } from 'vue-class-component';

import BlockWidget from '@/components/BlockWidget';
import { OneWireTempSensorBlock } from '../OneWireTempSensor/state';
import { SetPointSimpleBlock } from '../SetPointSimple/state';

import { getById as getSensorById } from '../OneWireTempSensor/getters';
import { getById as getSetPointById } from '../SetPointSimple/getters';

import { SensorSetPointPairBlock } from './state';
import { getById } from './getters';


@Component
export default class SensorSetPointPairWidget extends mixins(BlockWidget) {
  inputMapping = {
    setpoint: { path: 'setPoint.settings.value', default: 0 },
  };

  get block(): SensorSetPointPairBlock {
    return getById(this.$store, this.options.blockId);
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
</script>

<template>
  <div>
    <q-toolbar color="dark-bright">
      <q-toolbar-title>
        {{ block.serviceId }}/{{ block.id }}
      </q-toolbar-title>
    </q-toolbar>

    <q-card>
      <q-card-main>
        <q-list>
          <q-item class="grid-items-2">
            <q-item-main>
              <q-item-tile sublabel>Sensor</q-item-tile>
              <q-item-tile
                label
                class="q-headline"
              >
                {{ sensor.data.value | unit }}
              </q-item-tile>
            </q-item-main>
            <q-item-main>
              <q-item-tile sublabel>Setpoint</q-item-tile>
              <q-input
                v-model="inputs.setpoint"
                type="number"
                :suffix="sensor.data.value.unitNotation"
                numeric-keyboard-toggle
              />
            </q-item-main>
          </q-item>
        </q-list>
      </q-card-main>
      <q-card-separator />
      <q-card-actions align="end">
        <q-btn
          icon="check"
          :color="setpointChanged ? 'primary' : 'light'"
          :disable="!setpointChanged"
          @click="save"
        >
          Save changes
        </q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<style scoped>
.q-list {
  border: 0;
}

.q-item {
  display: grid;
  grid-gap: 10px;
}

.grid-items-2 {
  grid-template-columns: 1fr 1fr;
}
</style>
