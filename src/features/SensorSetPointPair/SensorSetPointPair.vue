<script lang="ts">
import Component from 'vue-class-component';

import Link from '@/helpers/units/Link';
import { saveBlock } from '@/store/blocks/actions';

import ProfilesBar from '@/components/ProfilesBar/ProfilesBar.vue';
import BlockComponent from '@/components/BlockComponent';

import {
  getById as getSetPointSimpleById,
  getAll as getAllSetPointSimple,
} from '../SetPointSimple/getters';

import {
  getById as getOneWireTempSensorById,
  getAll as getAllOneWireTempSensor,
} from '../OneWireTempSensor/getters';

import { getById } from './getters';

/* eslint-disable indent */
@Component({
  components: {
    ProfilesBar
  },
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

  get sensor() {
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
</script>

<template>
  <q-card>

    <q-card-title>SensorSetPointPair ({{ id }})</q-card-title>
    <profiles-bar :id="id"/>

    <q-card-main>
      <q-list>

        <q-btn
          :loading="loading"
          icon="check"
          :color="changed ? 'primary' : 'light'"
          :disable="!changed"
          @click="save"
          style="float: right; margin-top: -8px"
        >
          Save
        </q-btn>

        <q-list-header>Links</q-list-header>

        <q-item>
          <q-item-main>
            <q-select
              v-model="sensorInput"
              stack-label="Sensor"
              placeholder="Sensor ID"
              :options="allSensors"
            />
          </q-item-main>
        </q-item>

        <q-item>
          <q-item-main>
            <q-select
              v-model="setpointInput"
              stack-label="SetPoint"
              placeholder="SetPoint ID"
              :options="allSetPoints"
            />
          </q-item-main>

        </q-item>

      </q-list>
    </q-card-main>
  </q-card>
</template>
