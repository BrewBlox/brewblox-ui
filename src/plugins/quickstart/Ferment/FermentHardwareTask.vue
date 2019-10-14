<script lang="ts">
import { Component } from 'vue-property-decorator';

import WizardTaskBase from '@/components/Wizard/WizardTaskBase';
import { createDialog } from '@/helpers/dialog';
import { sparkStore } from '@/plugins/spark/store';

import { hasShared } from '../helpers';
import { PinChannel } from '../types';
import { FermentConfig } from './types';


@Component
export default class FermentHardwareTask extends WizardTaskBase<FermentConfig> {
  coolPin: PinChannel | null = null;
  heatPin: PinChannel | null = null;
  fridgeSensor: string | null = null;
  beerSensor: string | null = null;

  get valuesOk(): boolean {
    return [
      this.coolPin,
      this.heatPin,
      !this.pinSame,
      this.fridgeSensor,
      this.beerSensor,
      !this.sensorSame,
    ]
      .every(Boolean);
  }

  get pinSame(): boolean {
    return hasShared([this.coolPin, this.heatPin]);
  }

  get sensorSame(): boolean {
    return hasShared([this.fridgeSensor, this.beerSensor]);
  }

  created(): void {
    this.discover();

    this.coolPin = this.config.coolPin || null;
    this.heatPin = this.config.heatPin || null;
    this.fridgeSensor = this.config.fridgeSensor || null;
    this.beerSensor = this.config.beerSensor || null;
  }

  discover(): void {
    sparkStore.fetchDiscoveredBlocks(this.config.serviceId);
  }

  startBlockWizard(): void {
    createDialog({
      component: 'BlockWizardDialog',
      serviceId: this.config.serviceId,
      parent: this,
    });
  }

  taskDone(): void {
    this.config.heatPin = this.heatPin!;
    this.config.coolPin = this.coolPin!;
    this.config.fridgeSensor = this.fridgeSensor!;
    this.config.beerSensor = this.beerSensor!;

    this.config.renamedBlocks = {
      [this.fridgeSensor!]: this.config.names.fridgeSensor,
      [this.beerSensor!]: this.config.names.beerSensor,
    };

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
            :error="pinSame"
            label="Cooler output"
          />
        </q-item-section>
        <q-item-section>
          <QuickStartPinField
            v-model="heatPin"
            :service-id="config.serviceId"
            :error="pinSame"
            label="Heater output"
          />
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <QuickStartSensorField
            v-model="fridgeSensor"
            :service-id="config.serviceId"
            :error="sensorSame"
            label="Fridge Sensor"
          />
        </q-item-section>
        <q-item-section>
          <QuickStartSensorField
            v-model="beerSensor"
            :service-id="config.serviceId"
            :error="sensorSame"
            label="Beer Sensor"
          />
        </q-item-section>
      </q-item>
      <CardWarning v-if="pinSame">
        <template #message>
          Multiple outputs are using the same Pin.
        </template>
      </CardWarning>
      <CardWarning v-if="sensorSame">
        <template #message>
          Multiple sensors are using the same Block.
        </template>
      </CardWarning>
    </q-card-section>

    <q-separator dark />

    <q-card-actions>
      <q-btn unelevated label="Back" @click="back" />
      <q-space />
      <q-btn :disable="!valuesOk" unelevated label="Next" color="primary" @click="taskDone" />
    </q-card-actions>
  </div>
</template>
