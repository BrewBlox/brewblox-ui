<script lang="ts">
import isEqual from 'lodash/isEqual';
import { Component } from 'vue-property-decorator';

import WizardTaskBase from '@/components/Wizard/WizardTaskBase';
import { createDialog } from '@/helpers/dialog';
import { sparkStore } from '@/plugins/spark/store';

import { PinChannel } from '../types';
import { RimsConfig } from './types';


@Component
export default class RimsHardwareTask extends WizardTaskBase<RimsConfig> {
  kettlePin: PinChannel | null = null;
  mashPin: PinChannel | null = null;
  pumpPin: PinChannel | null = null;
  kettleSensor: string | null = null;

  get valuesOk(): boolean {
    return [
      this.kettlePin,
      this.mashPin,
      this.pumpPin,
      this.kettleSensor,
      !this.pinSame,
    ]
      .every(Boolean);
  }

  get pinRules(): InputRule[] {
    return [
      v => !!v || 'Pin must be selected',
    ];
  }

  get sensorRules(): InputRule[] {
    return [
      v => !!v || 'Sensor must be selected',
    ];
  }

  get pinSame(): boolean {
    if (!this.kettlePin || !this.mashPin || !this.pumpPin) {
      return false;
    }
    return [
      isEqual(this.kettlePin, this.mashPin),
      isEqual(this.kettlePin, this.pumpPin),
      isEqual(this.mashPin, this.pumpPin),
    ]
      .some(Boolean);
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
    this.config.kettlePin = this.kettlePin as PinChannel;
    this.config.mashPin = this.mashPin as PinChannel;
    this.config.pumpPin = this.pumpPin as PinChannel;

    Object.assign(
      this.config.renamedBlocks,
      {
        [this.kettleSensor as string]: this.config.names.kettleSensor,
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
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <QuickStartPinField
            v-model="kettlePin"
            :service-id="config.serviceId"
            :rules="pinRules"
            label="Kettle heater"
          />
        </q-item-section>
        <q-item-section>
          <QuickStartPinField
            v-model="mashPin"
            :service-id="config.serviceId"
            :rules="pinRules"
            label="Mash heater"
          />
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <QuickStartPinField
            v-model="pumpPin"
            :service-id="config.serviceId"
            :rules="pinRules"
            label="Pump"
          />
        </q-item-section>
        <q-item-section />
      </q-item>
      <q-item dark>
        <q-item-section>
          <QuickStartSensorField
            v-model="kettleSensor"
            :service-id="config.serviceId"
            label="Kettle Sensor"
            :rules="sensorRules"
          />
        </q-item-section>
        <q-item-section />
      </q-item>
      <CardWarning v-if="pinSame">
        <template #message>
          One or more outputs are using the same Pin.
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
