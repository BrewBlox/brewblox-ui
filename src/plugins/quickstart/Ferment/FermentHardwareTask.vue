<script lang="ts">
import isEqual from 'lodash/isEqual';
import { Component } from 'vue-property-decorator';

import WizardTaskBase from '@/components/Wizard/WizardTaskBase';
import { createDialog } from '@/helpers/dialog';
import { sparkStore } from '@/plugins/spark/store';

import { PinChannel } from '../types';
import { FermentConfig } from './types';


@Component
export default class FermentHardwareTask extends WizardTaskBase<FermentConfig> {
  readonly config!: FermentConfig;

  coolPin: PinChannel | null = null;
  heatPin: PinChannel | null = null;
  fridgeSensor: string | null = null;
  beerSensor: string | null = null;

  get valuesOk(): boolean {
    return [
      this.coolPin,
      this.heatPin,
      !isEqual(this.coolPin, this.heatPin),
      this.fridgeSensor,
      this.beerSensor,
      this.fridgeSensor !== this.beerSensor,
    ]
      .every(Boolean);
  }

  get pinRules(): InputRule[] {
    return [
      v => !!v || 'Pin must be selected',
      () => !isEqual(this.coolPin, this.heatPin) || 'Cool pin and Heat pin may not be the same',
    ];
  }

  get sensorRules(): InputRule[] {
    return [
      v => !!v || 'Sensor must be selected',
      () => this.fridgeSensor !== this.beerSensor || 'Fridge sensor and Beer sensor may not be the same',
    ];
  }

  created(): void {
    this.discover();
  }

  discover(): void {
    sparkStore.fetchDiscoveredBlocks(this.config.serviceId);
  }

  startBlockWizard(): void {
    createDialog({
      component: 'BlockWizardDialog',
      serviceId: this.config.serviceId,
      root: this.$root,
    });
  }

  taskDone(): void {
    this.config.heatPin = this.heatPin as PinChannel;
    this.config.coolPin = this.coolPin as PinChannel;

    Object.assign(
      this.config.renamedBlocks,
      {
        [this.fridgeSensor as string]: this.config.names.fridgeSensor,
        [this.beerSensor as string]: this.config.names.beerSensor,
      },
    );

    this.updateConfig(this.config);
    this.next();
  }
}
</script>

<template>
  <div>
    <q-card-section>
      <q-item dark>
        <q-item-section>
          <q-item-label class="text-subtitle1">
            Assign Hardware Blocks
          </q-item-label>
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn flat round icon="refresh" @click="discover">
            <q-tooltip>Discover OneWire Blocks</q-tooltip>
          </q-btn>
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn flat round icon="add" @click="startBlockWizard">
            <q-tooltip>Create new Block</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>
      <q-item dark class="text-weight-light">
        <q-item-section>
          <p>
            Select which hardware should be used for each function.<br />
            You can unplug or heat sensors to identify them.
            The current value will be shown under each dropdown menu.
          </p>
          <p>
            Use the buttons above to discover new OneWire blocks or manually create a block.
          </p>
          <p>
            We will also set some constraints on the heater and cooler:
            <ul>
              <li>Minimum ON and OFF times to protect the compressor</li>
              <li>Minimum wait times for switching between heating and cooling</li>
            </ul>
          </p>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <QuickStartPinField
            v-model="coolPin"
            :service-id="config.serviceId"
            :rules="pinRules"
            label="Cooler output"
          />
        </q-item-section>
        <q-item-section>
          <QuickStartPinField
            v-model="heatPin"
            :service-id="config.serviceId"
            :rules="pinRules"
            label="Heater output"
          />
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <QuickStartSensorField
            v-model="fridgeSensor"
            :service-id="config.serviceId"
            label="Fridge Sensor"
            :rules="sensorRules"
          />
        </q-item-section>
        <q-item-section>
          <QuickStartSensorField
            v-model="beerSensor"
            :service-id="config.serviceId"
            label="Beer Sensor"
            :rules="sensorRules"
          />
        </q-item-section>
      </q-item>
    </q-card-section>

    <q-separator dark />

    <q-card-actions>
      <q-btn unelevated label="Back" @click="back" />
      <q-space />
      <q-btn :disable="!valuesOk" unelevated label="Next" color="primary" @click="taskDone" />
    </q-card-actions>
  </div>
</template>
