<script lang="ts">
import isEqual from 'lodash/isEqual';
import { Component } from 'vue-property-decorator';

import WizardTaskBase from '@/components/Wizard/WizardTaskBase';
import { createDialog } from '@/helpers/dialog';
import { sparkStore } from '@/plugins/spark/store';

import { PinChannel } from '../types';
import { HermsConfig } from './types';


@Component
export default class HermsHardwareTask extends WizardTaskBase<HermsConfig> {
  hltPin: PinChannel | null = null;
  bkPin: PinChannel | null = null;
  hltSensor: string | null = null;
  mtSensor: string | null = null;
  bkSensor: string | null = null;

  get valuesOk(): boolean {
    return [
      this.hltPin,
      this.bkPin,
      !isEqual(this.hltPin, this.bkPin),
      this.hltSensor,
      this.mtSensor,
      this.bkSensor,
      !this.sensorSame,
    ]
      .every(Boolean);
  }

  get pinRules(): InputRule[] {
    return [
      v => !!v || 'Pin must be selected',
      () => !isEqual(this.hltPin, this.bkPin) || 'HLT pin and BK pin may not be the same',
    ];
  }

  get sensorRules(): InputRule[] {
    return [
      v => !!v || 'Sensor must be selected',
    ];
  }

  get sensorSame(): boolean {
    if (!this.hltSensor || !this.mtSensor || !this.bkSensor) {
      return false;
    }
    return [
      this.hltSensor === this.mtSensor,
      this.hltSensor === this.bkSensor,
      this.mtSensor === this.bkSensor,
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
    this.config.bkPin = this.bkPin as PinChannel;
    this.config.hltPin = this.hltPin as PinChannel;

    Object.assign(
      this.config.renamedBlocks,
      {
        [this.hltSensor as string]: this.config.names.hltSensor,
        [this.mtSensor as string]: this.config.names.mtSensor,
        [this.bkSensor as string]: this.config.names.bkSensor,
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
            v-model="hltPin"
            :service-id="config.serviceId"
            :rules="pinRules"
            label="HLT output"
          />
        </q-item-section>
        <q-item-section>
          <QuickStartPinField
            v-model="bkPin"
            :service-id="config.serviceId"
            :rules="pinRules"
            label="BK output"
          />
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <QuickStartSensorField
            v-model="hltSensor"
            :service-id="config.serviceId"
            label="HLT Sensor"
            :rules="sensorRules"
          />
        </q-item-section>
        <q-item-section>
          <QuickStartSensorField
            v-model="bkSensor"
            :service-id="config.serviceId"
            label="BK Sensor"
            :rules="sensorRules"
          />
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <QuickStartSensorField
            v-model="mtSensor"
            :service-id="config.serviceId"
            label="MT Sensor"
            :rules="sensorRules"
          />
        </q-item-section>
        <q-item-section />
      </q-item>
      <CardWarning v-if="sensorSame">
        <template #message>
          One or more sensors are using the same Block.
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
