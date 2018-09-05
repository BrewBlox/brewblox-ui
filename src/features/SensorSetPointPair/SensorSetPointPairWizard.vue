<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import shortid from 'shortid';

import Link from '@/helpers/units/Link';
import { DeviceService } from '@/store/services/state';
import { deviceServices } from '@/store/services/getters';
import { Block } from '@/store/blocks/state';
import { createBlock } from '@/store/blocks/actions';

import { getAll as getAllSetPointSimple } from '../SetPointSimple/getters';
import { getAll as getAllOneWireTempSensor } from '../OneWireTempSensor/getters';

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
export default class SensorSetPointPairWizard extends Vue {
  currentStep: string = 'service';
  creating: boolean = false;
  service: DeviceService | null = null;
  setpointInput: Block | null = null;
  sensorInput: Block | null = null;

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
</script>

<template>
  <q-stepper
    ref="stepper"
    v-model="currentStep"
  >
    <q-step
      default
      name="service"
      title="Which controller service?"
    >
      <q-field
        label="Choose controller service to create sensor set point pair on"
        orientation="vertical"
        dark
        icon="settings system daydream"
      >
        <q-option-group
          dark
          type="radio"
          v-model="service"
          @input="clearLinks"
          :options="services"
        />
      </q-field>
    </q-step>
    <q-step
      default
      name="sensor-setpoint"
      title="Link sensor and setpoint"
    >
      <q-field
        label="Pick a sensor"
        orientation="vertical"
        dark
        icon="settings input antenna"
      >
        <q-select
          v-model="sensorInput"
          :options="allSensors"
        />
      </q-field>

      <q-field
        label="Pick a set point"
        orientation="vertical"
        dark
        icon="input"
      >
        <q-select
          v-model="setpointInput"
          :options="allSetPoints"
        />
      </q-field>
    </q-step>
    <q-step
      default
      name="create"
      title="Create block"
    >
      <p class="q-title">Done!</p>
      <p>
        Sensor SetPoint Pair is ready to be created.
      </p>
    </q-step>

    <q-stepper-navigation>
      <q-btn
        v-if="currentStep === 'service'"
        flat
        @click="$props.onCancel"
        label="Cancel"
      />
      <q-btn
        v-if="currentStep !== 'service'"
        flat
        @click="$refs.stepper.previous()"
        label="Back"
      />
      <q-btn
        v-if="currentStep !== 'create'"
        :color="!canContinue ? 'dark-bright' : 'primary'"
        :disabled="!canContinue"
        @click="$refs.stepper.next()"
        label="Next"
      />
      <q-btn
        v-if="currentStep === 'create'"
        color="primary"
        label="Create"
        :loading="creating"
        @click="createBlock"
      />
    </q-stepper-navigation>
  </q-stepper>
</template>
